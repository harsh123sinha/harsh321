export const initialChatState = {
  messages: [],
  phase: 'welcome',
  category: null,
  formStep: 0,
  answers: {},
  typing: false,
  loading: false,
  searchResults: [],
  searchError: null,
};

let msgId = 1;
export const nextMsgId = () => {
  msgId += 1;
  return `m-${msgId}`;
};

export function chatReducer(state, action) {
  switch (action.type) {
    case 'INIT_SESSION':
      return {
        ...initialChatState,
        phase: 'category',
        messages: [{ id: 'welcome-htls', role: 'bot', text: action.payload }],
      };
    case 'RESET':
      return { ...initialChatState };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case 'SET_CATEGORY':
      return {
        ...state,
        category: action.payload,
        formStep: 0,
        phase: 'form',
        answers: {},
      };
    case 'PATCH_ANSWERS':
      return {
        ...state,
        answers: { ...state.answers, ...action.payload },
      };
    case 'NEXT_STEP':
      return { ...state, formStep: state.formStep + 1 };
    case 'SET_PHASE':
      return { ...state, phase: action.payload };
    case 'SET_TYPING':
      return { ...state, typing: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_SEARCH':
      return {
        ...state,
        searchResults: action.payload.results,
        searchError: action.payload.error ?? null,
        phase: action.payload.phase ?? 'results',
        loading: false,
        typing: false,
      };
    default:
      return state;
  }
}
