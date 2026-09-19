import { ASSETS, PORTFOLIO, type Asset } from "@/data/assets";

export type Holding = { asset: Asset; weight: number; value: number };

/** Notional book size used to turn sample weights into readable values. */
export const BOOK = 250_000;

export function buildHoldings(): Holding[] {
  return PORTFOLIO.map((p) => {
    const asset = ASSETS.find((a) => a.symbol === p.symbol)!;
    return { asset, weight: p.weight, value: (p.weight / 100) * BOOK };
  }).filter((h) => h.asset);
}

export function weightedChange(h: Holding[], key: "change24h" | "change30d"): number {
  return h.reduce((sum, x) => sum + (x.weight / 100) * x.asset[key], 0);
}

export function weightedVolatility(h: Holding[]): number {
  return h.reduce((sum, x) => sum + (x.weight / 100) * x.asset.vol30d, 0);
}

/** Share of total volatility contributed by each position. */
export function riskContribution(h: Holding[]): { symbol: string; share: number }[] {
  const raw = h.map((x) => ({ symbol: x.asset.symbol, v: (x.weight / 100) * x.asset.vol30d }));
  const total = raw.reduce((s, r) => s + r.v, 0) || 1;
  return raw.map((r) => ({ symbol: r.symbol, share: (r.v / total) * 100 })).sort((a, b) => b.share - a.share);
}

export function byClass(h: Holding[]): { cls: string; weight: number }[] {
  const map = new Map<string, number>();
  h.forEach((x) => map.set(x.asset.cls, (map.get(x.asset.cls) ?? 0) + x.weight));
  return [...map.entries()].map(([cls, weight]) => ({ cls, weight })).sort((a, b) => b.weight - a.weight);
}

export function correlation(a: Asset, b: Asset): number | null {
  if (a.symbol === b.symbol) return 1;
  const hit = a.correlations.find((c) => c.symbol === b.symbol);
  if (hit) return hit.r;
  const back = b.correlations.find((c) => c.symbol === a.symbol);
  return back ? back.r : null;
}

/** Weight sitting in positions that correlate above `threshold` with each other. */
export function clusteredWeight(h: Holding[], threshold = 0.6): number {
  const flagged = new Set<string>();
  for (let i = 0; i < h.length; i++) {
    for (let j = i + 1; j < h.length; j++) {
      const r = correlation(h[i].asset, h[j].asset);
      if (r !== null && r >= threshold) {
        flagged.add(h[i].asset.symbol);
        flagged.add(h[j].asset.symbol);
      }
    }
  }
  return h.filter((x) => flagged.has(x.asset.symbol)).reduce((s, x) => s + x.weight, 0);
}

export function money(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}
