export const SIDEBAR_MOBILE_BREAKPOINT = 768;

export function isDesktopViewport() {
  return typeof window !== 'undefined' && window.innerWidth >= SIDEBAR_MOBILE_BREAKPOINT;
}
