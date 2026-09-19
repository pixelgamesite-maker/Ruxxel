export function price(n: number): string {
  const digits = n >= 1 ? 2 : 4;
  return n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function pct(n: number, withSign = true): string {
  const sign = withSign && n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

export function dirClass(n: number): string {
  if (n > 0) return "up";
  if (n < 0) return "down";
  return "";
}

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

export function shortAddress(a: string): string {
  return a.length > 12 ? `${a.slice(0, 6)}...${a.slice(-4)}` : a;
}
