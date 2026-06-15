/* Shared inline icons for the child area (rounded line style, no assets). */
const base = "size-full";

export function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={base}>
      <path d="M4 11 12 4l8 7M6 10v9h12v-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
      <path d="M12 7c.6 2.4 2.6 4.4 5 5-2.4.6-4.4 2.6-5 5-.6-2.4-2.6-4.4-5-5 2.4-.6 4.4-2.6 5-5z" fill="currentColor" opacity=".5" />
    </svg>
  );
}
export function IconMic() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={base}>
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
export function IconTasks() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={base}>
      <rect x="5" y="4" width="14" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m8.5 10 1.5 1.5L13 8M8.5 15.5h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
