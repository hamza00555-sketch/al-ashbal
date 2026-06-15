/* Inline icons for the guest overview (rounded line style, no assets). */
const base = "size-full";

export function IconHalaqa() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={base}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
export function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={base}>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 6.2a3 3 0 0 1 0 5.6M17 19a5.5 5.5 0 0 0-2-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
export function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={base}>
      <rect x="4" y="5" width="16" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 9h16M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
export function IconBadge() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={base}>
      <path d="m12 3 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9 6.8 19l1-5.8L3.6 9.1l5.8-.8z" />
    </svg>
  );
}
