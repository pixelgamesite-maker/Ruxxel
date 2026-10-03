export function isEvmAddress(a: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(a.trim());
}

export function isHttpUrl(u: string): boolean {
  try {
    const url = new URL(u.trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export const shortAddr = (a: string) => (a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a);

const pad = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, "0");

/** 1,800,000 ms -> "00:30:00" */
export function fmtHMS(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${pad(s / 3600)}:${pad((s % 3600) / 60)}:${pad(s % 60)}`;
}

/** 179,000 ms -> "02:59" */
export function fmtMS(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${pad(s / 60)}:${pad(s % 60)}`;
}

/** $968K, $7.0M, $22K, $1K. */
export function fmtUsdCompact(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${Math.round(n / 1e3)}K`;
  return `$${Math.round(n)}`;
}

/** $0.2577, $0.00000390, $241.88 */
export function fmtPrice(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n >= 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(8)}`;
}

export function fmtPct(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
}
