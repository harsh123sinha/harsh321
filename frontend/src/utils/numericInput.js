/** Strip non-digits and cap length — for price, pincode, floor, BHK, etc. */
export function digitsOnly(value, maxLen) {
  return String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, maxLen);
}

export function blockNonDigitKeyDown(e) {
  const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
  if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
  if (!/^\d$/.test(e.key)) e.preventDefault();
}
