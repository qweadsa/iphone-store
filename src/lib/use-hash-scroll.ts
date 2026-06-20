"use client";

import { useEffect } from "react";

const HASH_TARGETS = new Set(["draw", "prizes"]);

function headerOffset(): number {
  if (typeof window === "undefined") return 0;
  return window.matchMedia("(max-width: 767px)").matches ? 118 : 64;
}

export function scrollToPageHash(behavior: ScrollBehavior = "smooth") {
  const raw = window.location.hash.replace(/^#/, "");
  if (!HASH_TARGETS.has(raw)) return;
  const el = document.getElementById(raw);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset();
  window.scrollTo({ top: Math.max(0, top), behavior });
}

/** Scroll to #draw / #prizes after hydration (refresh or in-page link). */
export function useHashScroll() {
  useEffect(() => {
    if (!window.location.hash) return;
    const run = () => scrollToPageHash("smooth");
    requestAnimationFrame(() => {
      setTimeout(run, 80);
    });
  }, []);
}
