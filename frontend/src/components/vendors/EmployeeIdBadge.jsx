import { formatEmployeeId } from '../../utils/helpers';

export default function EmployeeIdBadge({ employeeId, workerId, className = '' }) {
  const id = employeeId || formatEmployeeId(workerId);
  if (!id) return null;

  return (
    <span
      className={`inline-flex items-center rounded-md border border-gold/40 bg-gold/10 px-2 py-0.5 text-[11px] font-bold tracking-wide text-navy ${className}`}
    >
      ID: {id}
    </span>
  );
}
