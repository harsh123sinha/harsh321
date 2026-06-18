const TypingIndicator = () => (
  <div
    className="inline-flex items-center gap-1 rounded-2xl bg-slate-100 px-4 py-2"
    aria-hidden
  >
    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
  </div>
);

export default TypingIndicator;
