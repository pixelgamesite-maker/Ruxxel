import { ClaimError, type ClaimApi, type ClaimStatus, type ClaimWindow } from "./types";

/**
 * In-browser stand-in for the backend, for design review and QA only.
 * Enabled with VITE_CLAIM_MOCK=1. State lives in localStorage so refresh and
 * reconnect behave like the real thing.
 *
 *  - The window opens when you first load the page and runs 30 minutes.
 *  - Any wallet is eligible except addresses ending in "0".
 *  - Processing takes 3:00 (15s with VITE_CLAIM_MOCK_FAST=1), then 6s of
 *    "finalizing" before it completes.
 *  - Add ?window=45 to the URL to make the window 45 seconds (test the close).
 */

const KEY = "ruxxells_mock_v1";
const FAST = import.meta.env.VITE_CLAIM_MOCK_FAST === "1";
const PROCESS_MS = FAST ? 15_000 : 180_000;
const CONFIRM_MS = 6_000;

type Store = { opensAt: number; closesAt: number; claims: Record<string, number> };

function load(): Store {
  const params = new URLSearchParams(window.location.search);
  const windowSec = Number(params.get("window")) || 30 * 60;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw && !params.has("window")) return JSON.parse(raw) as Store;
  } catch {
    /* fall through to a fresh store */
  }
  const now = Date.now();
  const s: Store = { opensAt: now, closesAt: now + windowSec * 1000, claims: {} };
  localStorage.setItem(KEY, JSON.stringify(s));
  return s;
}

const save = (s: Store) => localStorage.setItem(KEY, JSON.stringify(s));
const wait = (n: number) => new Promise((r) => setTimeout(r, n));

function statusFor(s: Store, wallet: string): ClaimStatus {
  const w = wallet.toLowerCase();
  if (w.endsWith("0")) return { state: "none" };
  const acceptedAt = s.claims[w];
  if (!acceptedAt) return { state: "eligible" };

  const deliverAt = acceptedAt + PROCESS_MS;
  const now = Date.now();
  if (now < deliverAt) return { state: "processing", acceptedAt, deliverAt };

  const fakeTx = `0x${[...w.slice(2)].reverse().join("").padEnd(64, "a").slice(0, 64)}`;
  if (now < deliverAt + CONFIRM_MS) return { state: "finalizing", acceptedAt, txHash: fakeTx };
  return { state: "complete", txHash: fakeTx, tokenId: "412" };
}

export function createMockApi(): ClaimApi {
  return {
    async getWindow(): Promise<ClaimWindow> {
      await wait(120);
      const s = load();
      return { serverTime: Date.now(), opensAt: s.opensAt, closesAt: s.closesAt };
    },
    async getStatus(wallet) {
      await wait(350);
      return statusFor(load(), wallet);
    },
    async challenge(wallet) {
      await wait(150);
      const nonce = Math.random().toString(36).slice(2, 10);
      return {
        nonce,
        message: [
          "ruxxells.fun wants you to claim a FREE Ruxxell.",
          "",
          `Wallet: ${wallet}`,
          "Claim: FREE-1",
          `Nonce: ${nonce}`,
          `Issued at: ${new Date().toISOString()}`,
        ].join("\n"),
      };
    },
    async submit(wallet) {
      await wait(500);
      const s = load();
      const now = Date.now();
      if (now < s.opensAt) throw new ClaimError("not_open");
      if (now > s.closesAt) throw new ClaimError("closed");
      const cur = statusFor(s, wallet);
      if (cur.state === "none") throw new ClaimError("not_eligible");
      if (cur.state !== "eligible") throw new ClaimError("already_claimed");
      s.claims[wallet.toLowerCase()] = now;
      save(s);
      return statusFor(s, wallet);
    },
  };
}
