const FieldHint = ({ error }) =>
  error ? <p className="mt-1 text-xs text-red-600 font-medium">{error}</p> : null;

export default FieldHint;
