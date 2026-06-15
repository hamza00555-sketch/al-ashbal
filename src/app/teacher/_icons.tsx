/* Shared inline icons for the teacher area (rounded line style, no assets). */
const base = "size-full";

export function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={base}>
      <path d="M4 11 12 4l8 7M6 10v9h12v-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
export function IconVideo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={base}>
      <rect x="3" y="6" width="12" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m15 10 5-3v10l-5-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
export function IconBook() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={base}>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H12v15H5.5A1.5 1.5 0 0 0 4 20.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H12v15h6.5a1.5 1.5 0 0 1 1.5 1.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
export function IconPrep() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={base}>
      <rect x="5" y="4" width="14" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 3.5h6v3H9zM8.5 11h7M8.5 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
