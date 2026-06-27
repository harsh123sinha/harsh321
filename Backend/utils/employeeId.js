/** Public employee reference — shown on Our Services cards and WhatsApp inquiries */
export function formatEmployeeId(workerId) {
  const n = Number(workerId);
  if (!Number.isFinite(n) || n <= 0) return '';
  return `HTLS-EMP-${String(Math.trunc(n)).padStart(6, '0')}`;
}
