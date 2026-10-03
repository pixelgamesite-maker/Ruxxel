import { useEffect } from "react";
import { useLocation } from "wouter";

export default function ScrollToTop() {
  const [path] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [path]);
  return null;
}
