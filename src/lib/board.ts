import { useEffect, useState } from "react";
import { BOARD, BOARD_REFRESH_MS, type BoardToken } from "@/data/board";

export type Quote = {
  price: number;
  change24h: number;
  volume24h: number;
  liquidity: number;
  url: string;
};

type Pair = {
  chainId?: string;
  baseToken?: { address?: string };
  priceUsd?: string;
  priceChange?: { h24?: number };
  volume?: { h24?: number };
  liquidity?: { usd?: number };
  url?: string;
};

async function fetchQuote(t: BoardToken, signal: AbortSignal): Promise<Quote | null> {
  const endpoint = t.pair
    ? `https://api.dexscreener.com/latest/dex/pairs/${t.chain}/${t.pair}`
    : `https://api.dexscreener.com/latest/dex/tokens/${t.address}`;

  const res = await fetch(endpoint, { signal });
  if (!res.ok) throw new Error(`${t.symbol} ${res.status}`);
  const json = (await res.json()) as { pairs?: Pair[] | null };

  const pairs = (json.pairs ?? []).filter((p) => !p.chainId || p.chainId === t.chain);
  const best = t.pair
    ? pairs[0]
    : pairs
        .filter((p) => p.baseToken?.address?.toLowerCase() === t.address.toLowerCase())
        .sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];

  if (!best?.priceUsd) return null;
  return {
    price: Number(best.priceUsd),
    change24h: best.priceChange?.h24 ?? 0,
    volume24h: best.volume?.h24 ?? 0,
    liquidity: best.liquidity?.usd ?? 0,
    url: best.url ?? `https://dexscreener.com/search?q=${encodeURIComponent(t.address)}`,
  };
}

/**
 * Live quotes for The Board. Quotes stay null until real data arrives, so the
 * interface never shows a number it did not get.
 */
export function useBoard() {
  const [quotes, setQuotes] = useState<Record<string, Quote | null>>({});

  useEffect(() => {
    let alive = true;
    let ctl = new AbortController();

    const load = async () => {
      ctl = new AbortController();
      const results = await Promise.all(
        BOARD.map((t) => fetchQuote(t, ctl.signal).catch(() => null)),
      );
      if (!alive) return;
      setQuotes((prev) => {
        const next = { ...prev };
        BOARD.forEach((t, i) => {
          // keep the last good quote if a refresh fails
          next[t.symbol] = results[i] ?? prev[t.symbol] ?? null;
        });
        return next;
      });
    };

    void load();
    const id = window.setInterval(load, BOARD_REFRESH_MS);
    return () => {
      alive = false;
      ctl.abort();
      window.clearInterval(id);
    };
  }, []);

  return quotes;
}
