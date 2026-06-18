import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
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

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [state, dispatch] = useReducer(chatReducer, initialChatState);
  const [lastQs, setLastQs] = useState('');
  const stateRef = useRef(state);
  const prevOpen = useRef(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const fn = () => setIsMobile(mq.matches);
    fn();
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);

  useEffect(() => {
    if (!open) {
      prevOpen.current = false;
      return;
    }
    if (prevOpen.current) return;
    prevOpen.current = true;
    dispatch({ type: 'INIT_SESSION', payload: WELCOME });
    setLastQs('');
  }, [open]);

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
      const qs = params.toString();
      setLastQs(qs);

      const res = await api.get(`/properties/search${qs ? `?${qs}` : ''}`);
      const raw = res.data?.properties ?? [];
      const refined = refineResults(category, mergedAnswers, raw);
      const slice = refined.slice(0, 15);

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
    dispatch({ type: 'INIT_SESSION', payload: WELCOME });
    setLastQs('');
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
              className="block rounded-xl bg-gold/15 py-3 text-center text-sm font-semibold text-navy ring-1 ring-gold/30"
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
        <ChatButton open={open} onClick={() => setOpen((v) => !v)} />
      )}
      <ChatWindow open={open} isMobile={isMobile} onClose={() => setOpen(false)} footer={footer}>
        <MessageList messages={state.messages} typing={state.typing} />
      </ChatWindow>
    </>
  );
};

export default ChatWidget;
