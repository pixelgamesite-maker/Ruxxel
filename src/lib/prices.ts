import { useEffect, useRef, useState } from "react";
import { ASSETS } from "@/data/assets";

/**
 * Live prices.
 *
 * Set VITE_PRICES_URL to an endpoint that returns:
 *   { "AAPLx": { "price": 241.88, "change24h": 1.42 }, ... }
 *
 * Until that exists the hook serves the sample dataset and reports live:false,
 * so the interface never sits empty and never lies about being live.
 *
 * Do NOT call a price API directly from the browser with a key in it. Put a
 * tiny serverless function in front (see README) — it keeps the key secret and
 * sidesteps CORS.
 */

export type Quote = { price: number; change24h: number };
export type Quotes = Record<string, Quote>;

const ENDPOINT = import.meta.env.VITE_PRICES_URL ?? "";

/** Sample data, used as the starting state and as the fallback. */
function seed(): Quotes {
  const out: Quotes = {};
  ASSETS.forEach((a) => (out[a.symbol] = { price: a.price, change24h: a.change24h }));
  return out;
}

export function usePrices(intervalMs = 20_000) {
  const [quotes, setQuotes] = useState<Quotes>(seed);
  const [live, setLive] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!ENDPOINT) return;

    let cancelled = false;
    const controller = new AbortController();

    async function pull() {
      try {
        const res = await fetch(ENDPOINT, { signal: controller.signal });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as Quotes;
        if (cancelled) return;
        setQuotes((prev) => ({ ...prev, ...data }));
        setLive(true);
        setUpdatedAt(Date.now());
      } catch {
        if (!cancelled) setLive(false);
      }
    }

    pull();
    timer.current = window.setInterval(pull, intervalMs);

    return () => {
      cancelled = true;
      controller.abort();
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [intervalMs]);

  return { quotes, live, updatedAt };
}
