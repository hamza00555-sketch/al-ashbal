/* Shared inline icons for the parent area (rounded line style, no assets). */
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
export function IconBell() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={base}>
      <path d="M6 10a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
export function IconStar() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={base}>
      <path d="m12 3 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9 6.8 19l1-5.8L3.6 9.1l5.8-.8z" />
    </svg>
  );
}
export function IconSparkle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={base}>
      <path d="M12 7c.6 2.4 2.6 4.4 5 5-2.4.6-4.4 2.6-5 5-.6-2.4-2.6-4.4-5-5 2.4-.6 4.4-2.6 5-5z" fill="currentColor" opacity=".55" />
    </svg>
  );
}
