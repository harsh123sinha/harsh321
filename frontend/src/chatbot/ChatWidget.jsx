import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../utils/api';
import './chatbot.css';
import ChatButton from './ChatButton';
import ChatWindow from './ChatWindow';
import MessageList from './MessageList';
import CategorySelector from './CategorySelector';
import DynamicFormEngine from './DynamicFormEngine';
import LoadingIndicator from './LoadingIndicator';
import { chatReducer, initialChatState, nextMsgId } from './chatReducer';
import { getStepsForCategory, categoryLabel } from './stepConfig';
import { buildSearchParams, refineResults } from './buildSearchParams';

const WELCOME = `Namaste 👋 Harsh To Let Services me aapka swagat hai!

Hello 👋 Welcome to Harsh To Let Services!

Aap kya dekh rahe hain?
What are you looking for?`;

const CHAT_SESSION_STORAGE_KEY = 'hts-chatbot-session-v1';

function readPersistedChat() {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CHAT_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.v !== 1) return null;
    const messages = data.messages;
    if (!Array.isArray(messages) || messages.length === 0) return null;
    let phase = data.phase;
    if (phase === 'confirm') phase = 'form';
    if (!['welcome', 'category', 'form', 'results'].includes(phase)) phase = 'category';
    return {
      state: {
        ...initialChatState,
        messages,
        phase,
        category: data.category ?? null,
        formStep: Number.isFinite(Number(data.formStep)) ? Number(data.formStep) : 0,
        answers: data.answers && typeof data.answers === 'object' ? data.answers : {},
        searchResults: Array.isArray(data.searchResults) ? data.searchResults : [],
        searchError: data.searchError ?? null,
        typing: false,
        loading: false,
      },
      lastQs: typeof data.lastQs === 'string' ? data.lastQs : '',
    };
  } catch {
    return null;
  }
}

function writePersistedChat(state, lastQs) {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(
      CHAT_SESSION_STORAGE_KEY,
      JSON.stringify({
        v: 1,
        messages: state.messages,
        phase: state.phase,
        category: state.category,
        formStep: state.formStep,
        answers: state.answers,
        searchResults: state.searchResults,
        searchError: state.searchError,
        lastQs,
      })
    );
  } catch {
    /* quota / private mode */
  }
}

/** Swap this file in `public/` for your own art (PNG/WebP/SVG). */
const CHAT_TEASER_IMAGE_SRC = '/chatbot-teaser.svg';
const CHAT_TEASER_VISIBLE_MS = 5000;
const CHAT_TEASER_EXIT_AT_MS = 4500;

const ChatWidget = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [fabTeaserMounted, setFabTeaserMounted] = useState(false);
  const [fabTeaserExiting, setFabTeaserExiting] = useState(false);
  const [state, dispatch] = useReducer(
    chatReducer,
    undefined,
    () => readPersistedChat()?.state ?? chatReducer(initialChatState, { type: 'INIT_SESSION', payload: WELCOME })
  );
  const [lastQs, setLastQs] = useState(() => readPersistedChat()?.lastQs ?? '');
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  /** Keep assistant progress across navigation / close panel until "New requirement" clears storage. */
  useEffect(() => {
    writePersistedChat(state, lastQs);
  }, [state, lastQs]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const fn = () => setIsMobile(mq.matches);
    fn();
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener('hts:open-chat', onOpen);
    return () => window.removeEventListener('hts:open-chat', onOpen);
  }, []);

  /** Home landing: animated card above the FAB, then hide after 5s. */
  useEffect(() => {
    if (open || location.pathname !== '/') {
      setFabTeaserMounted(false);
      setFabTeaserExiting(false);
      return undefined;
    }
    setFabTeaserMounted(true);
    setFabTeaserExiting(false);
    const exitTimer = window.setTimeout(() => setFabTeaserExiting(true), CHAT_TEASER_EXIT_AT_MS);
    const hideTimer = window.setTimeout(() => {
      setFabTeaserMounted(false);
      setFabTeaserExiting(false);
      window.dispatchEvent(new CustomEvent('hts:chat-teaser-finished'));
    }, CHAT_TEASER_VISIBLE_MS);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
    };
  }, [location.pathname, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const completeFlow = useCallback(async (mergedAnswers, category) => {
    dispatch({ type: 'SET_PHASE', payload: 'confirm' });
    dispatch({ type: 'SET_TYPING', payload: true });
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: nextMsgId(),
        role: 'bot',
        text:
          'We got your response 👍\nHarsh To Let Services is finding best property matches for you…\n\nAapki details mil gayi — ab best matches dhoondh rahe hain…',
      },
    });

    await new Promise((r) => setTimeout(r, 850));
    dispatch({ type: 'SET_TYPING', payload: false });

    try {
      const params = buildSearchParams(category, mergedAnswers);
      params.set('source', 'chatbot');
      const qs = params.toString();
      setLastQs(qs);

      const res = await api.get(`/properties/search${qs ? `?${qs}` : ''}`);
      const raw = res.data?.properties ?? [];
      const refined = refineResults(category, mergedAnswers, raw);
      const slice = refined.slice(0, 40);

      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: nextMsgId(),
          role: 'bot',
          text: slice.length
            ? `Yahan aapke liye kuch best options / Here are some of the best matches (${slice.length}):`
            : 'Is combination par abhi koi listing match nahi hui.\nNo listings matched this exact combination — try a wider area or budget on the search page.',
        },
      });

      if (slice.length) {
        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            id: nextMsgId(),
            role: 'bot',
            variant: 'carousel',
            properties: slice,
          },
        });
      }

      dispatch({
        type: 'SET_SEARCH',
        payload: { results: slice, error: null, phase: 'results' },
      });
    } catch {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: nextMsgId(),
          role: 'bot',
          text: 'Search abhi complete nahi ho paya. Kripya dubara try karein.\nWe could not complete the search. Please try again.',
        },
      });
      dispatch({
        type: 'SET_SEARCH',
        payload: { results: [], error: 'failed', phase: 'results' },
      });
    }
  }, []);

  const onCategory = (cat) => {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: { id: nextMsgId(), role: 'user', text: categoryLabel(cat) },
    });
    dispatch({ type: 'SET_CATEGORY', payload: cat });
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: nextMsgId(),
        role: 'bot',
        text: 'Kripya niche ke steps follow karein — hum aapke liye match dhundhenge.\nPlease follow the steps below and we will find matching listings.',
      },
    });
  };

  const onFormStep = useCallback(
    (summary, patch) => {
      const s = stateRef.current;
      const steps = getStepsForCategory(s.category);
      const stepIdx = s.formStep;
      const merged = { ...s.answers, ...patch };
      const isLast = stepIdx >= steps.length - 1;

      dispatch({
        type: 'ADD_MESSAGE',
        payload: { id: nextMsgId(), role: 'user', text: summary },
      });
      dispatch({ type: 'PATCH_ANSWERS', payload: patch });

      if (isLast) {
        completeFlow(merged, s.category);
      } else {
        dispatch({ type: 'NEXT_STEP' });
      }
    },
    [completeFlow]
  );

  const startOver = () => {
    try {
      sessionStorage.removeItem(CHAT_SESSION_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setLastQs('');
    dispatch({ type: 'INIT_SESSION', payload: WELCOME });
  };

  const steps = state.category ? getStepsForCategory(state.category) : [];
  const stepKey = steps[state.formStep] ?? null;

  const footer = (() => {
    if (state.loading) {
      return <LoadingIndicator label="Harsh To Let Services is matching listings…" />;
    }
    if (state.phase === 'category') {
      return <CategorySelector onSelect={onCategory} disabled={state.loading} />;
    }
    if (state.phase === 'form' && state.category && stepKey) {
      return (
        <DynamicFormEngine
          key={stepKey}
          stepKey={stepKey}
          category={state.category}
          disabled={state.loading}
          isLastStep={state.formStep >= steps.length - 1}
          onSubmit={onFormStep}
        />
      );
    }
    if (state.phase === 'results') {
      return (
        <div className="flex flex-col gap-2">
          {lastQs ? (
            <Link
              to={`/search?${lastQs}`}
              onClick={() => setOpen(false)}
              className="block rounded-xl bg-gold/15 py-3 text-center text-sm font-semibold text-navy ring-1 ring-gold/30 touch-manipulation"
            >
              Open full search results
            </Link>
          ) : null}
          <button
            type="button"
            onClick={startOver}
            className="w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-navy touch-manipulation"
          >
            New requirement
          </button>
        </div>
      );
    }
    return null;
  })();

  return (
    <>
      {(!open || !isMobile) && (
        <div className="pointer-events-none fixed bottom-5 right-5 z-[70] flex flex-col-reverse items-end gap-3 sm:bottom-6 sm:right-6 md:bottom-10 md:right-14 lg:bottom-12 lg:right-24 xl:bottom-14 xl:right-32">
          <ChatButton embedded open={open} onClick={() => setOpen((v) => !v)} />
          {fabTeaserMounted && location.pathname === '/' && !open ? (
            <div
              role="status"
              aria-live="polite"
              className={`pointer-events-auto max-w-[min(280px,calc(100vw-2rem))] rounded-2xl border border-red-500/45 bg-white/95 p-2.5 shadow-[0_16px_44px_-12px_rgba(220,38,38,0.4)] ring-1 ring-red-200/40 ${
                fabTeaserExiting ? 'htls-chat-teaser--exit' : 'htls-chat-teaser'
              }`}
            >
              <img
                src={CHAT_TEASER_IMAGE_SRC}
                alt=""
                width={160}
                height={120}
                decoding="async"
                className="mx-auto h-[4.25rem] w-auto max-w-full object-contain sm:h-[4.5rem]"
              />
              <p className="mt-1.5 px-0.5 text-center text-[11px] font-bold leading-snug text-navy sm:text-xs">
                Find your home with <span className="text-red-600">Chatbot</span>
              </p>
            </div>
          ) : null}
        </div>
      )}
      <ChatWindow open={open} isMobile={isMobile} onClose={() => setOpen(false)} footer={footer}>
        <MessageList messages={state.messages} typing={state.typing} onCloseChat={() => setOpen(false)} />
      </ChatWindow>
    </>
  );
};

export default ChatWidget;
