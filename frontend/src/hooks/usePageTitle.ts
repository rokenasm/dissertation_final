import { useEffect } from "react";

const BASE = "RMBuild";

/**
 * Set document.title for the current page. Pass a page-specific suffix;
 * the hook composes "RMBuild — {suffix}" and restores the base title on
 * unmount.
 */
export function usePageTitle(suffix: string) {
  useEffect(() => {
    document.title = suffix ? `${BASE} — ${suffix}` : BASE;
    return () => {
      document.title = `${BASE} — From drawing to quote in minutes`;
    };
  }, [suffix]);
}
