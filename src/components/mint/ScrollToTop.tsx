import { useEffect } from "react";
import { useLocation } from "wouter";

/** Wouter keeps scroll position between routes; reset it on navigation. */
export default function ScrollToTop() {
  const [path] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [path]);
  return null;
}
