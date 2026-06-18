const LoadingIndicator = ({ label }) => (
  <div className="flex flex-col items-center gap-3 py-4" role="status" aria-live="polite">
    <div className="h-9 w-9 rounded-full border-2 border-navy/20 border-t-gold animate-spin" />
    {label ? <p className="text-xs text-slate-500">{label}</p> : null}
  </div>
);

export default LoadingIndicator;
