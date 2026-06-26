/**
 * Open an external URL in a new tab — but ONLY for a valid http(s) link.
 * Centralizes the scheme check (blocks javascript:/data:/empty) and always
 * sets `noopener,noreferrer`. Returns true if it actually opened, so callers
 * can branch their own UI message on success/failure.
 */
export function openExternalLink(url: string | null | undefined): boolean {
  if (!url || !/^https?:\/\//.test(url)) return false;
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}
