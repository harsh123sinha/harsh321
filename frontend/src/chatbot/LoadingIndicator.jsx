import BrandLoader from '../components/ui/BrandLoader';

const LoadingIndicator = ({ label }) => (
  <div className="py-2" role="status" aria-live="polite">
    <BrandLoader size="sm" className="!py-2" />
    {label ? <p className="mt-2 text-center text-xs text-slate-500">{label}</p> : null}
  </div>
);

export default LoadingIndicator;
