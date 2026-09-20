import { useEffect, useRef, useState } from "react";
import { ASSETS } from "@/data/assets";

/**
 * Live prices, with two ways in.
 *
 * 1. VITE_PRICES_URL — your own endpoint returning
 *      { "AAPLx": { "price": 241.88, "change24h": 1.42 }, ... }
 *    Preferred. The key stays on your server and you can cache.
 *
 * 2. VITE_FINNHUB_KEY — called straight from the browser. Fast to set up, but
 *    anyone can read the key out of the bundle. Fine for a free tier, worth
 *    replacing with option 1 before you have real traffic.
 *
 * Neither set? The sample dataset is served and `live` stays false, so the
 * interface never claims data it does not have.
 */

export type Quote = { price: number; change24h: number };
export type Quotes = Record<string, Quote>;

const ENDPOINT = import.meta.env.VITE_PRICES_URL ?? "";
const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_KEY ?? "";

/**
 * Which real ticker each tokenized asset tracks. Finnhub quotes the underlying,
 * not the token, so the two can drift — the token is what actually trades.
 * Assets with no public quote stay on sample data.
 */
const UNDERLYING: Record<string, string | null> = {
  AAPLx: "AAPL",
  NVDAx: "NVDA",
  SPYx: "SPY",
  GOLDx: "GLD",
  OILx: "USO",
  REITx: "VNQ",
  TBILx: "BIL",
  PRVTx: null,
};

function seed(): Quotes {
  const out: Quotes = {};
  ASSETS.forEach((a) => (out[a.symbol] = { price: a.price, change24h: a.change24h }));
  return out;
}

/** Finnhub /quote: c = current, dp = percent change on the day. */
async function fromFinnhub(signal: AbortSignal): Promise<Quotes> {
  const pairs = Object.entries(UNDERLYING).filter(([, t]) => t) as [string, string][];

  const results = await Promise.all(
    pairs.map(async ([symbol, ticker]) => {
      const url = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_KEY}`;
      const res = await fetch(url, { signal });
      if (!res.ok) throw new Error(`${ticker} ${res.status}`);
      const q = (await res.json()) as { c?: number; dp?: number };
      if (!q.c) return null; // unknown ticker, or the plan does not cover it
      return [symbol, { price: q.c, change24h: q.dp ?? 0 }] as const;
    }),
  );

  const out: Quotes = {};
  results.forEach((r) => {
    if (r) out[r[0]] = r[1];
  });
  return out;
}

async function fromEndpoint(signal: AbortSignal): Promise<Quotes> {
  const res = await fetch(ENDPOINT, { signal });
  if (!res.ok) throw new Error(String(res.status));
  return (await res.json()) as Quotes;
}

export function usePrices(intervalMs = 30_000) {
  const [quotes, setQuotes] = useState<Quotes>(seed);
  const [live, setLive] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!ENDPOINT && !FINNHUB_KEY) return;

    let cancelled = false;
    const controller = new AbortController();

    async function pull() {
      try {
        const data = ENDPOINT
          ? await fromEndpoint(controller.signal)
          : await fromFinnhub(controller.signal);

        if (cancelled || Object.keys(data).length === 0) return;
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
