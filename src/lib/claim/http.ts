import { ClaimError, type ClaimApi, type ClaimStatus, type ClaimWindow, type Challenge } from "./types";

/**
 * Real backend client. Endpoints (see docs/CLAIM_API.md):
 *   GET  /config                       -> { serverTime, opensAt, closesAt }  (ISO strings)
 *   GET  /status?wallet=0x..           -> status
 *   POST /challenge { wallet }         -> { message, nonce }
 *   POST /claim { wallet, nonce, signature } -> status
 * Errors come back as { error: "<ClaimErrorCode>" } with a 4xx status.
 */

const ms = (iso: string) => new Date(iso).getTime();

type WireStatus =
  | { state: "none" }
  | { state: "eligible" }
  | { state: "processing"; acceptedAt: string; deliverAt: string }
  | { state: "finalizing"; acceptedAt: string; txHash?: string }
  | { state: "complete"; txHash: string; tokenId?: string };

function fromWire(s: WireStatus): ClaimStatus {
  switch (s.state) {
    case "processing":
      return { state: "processing", acceptedAt: ms(s.acceptedAt), deliverAt: ms(s.deliverAt) };
    case "finalizing":
      return { state: "finalizing", acceptedAt: ms(s.acceptedAt), txHash: s.txHash };
    default:
      return s;
  }
}

export function createHttpApi(base: string): ClaimApi {
  const root = base.replace(/\/$/, "");

  async function call<T>(path: string, init?: RequestInit): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${root}${path}`, {
        ...init,
        headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
      });
    } catch {
      throw new ClaimError("network");
    }
    if (!res.ok) {
      let code: string | undefined;
      try {
        code = ((await res.json()) as { error?: string }).error;
      } catch {
        /* non-JSON error body */
      }
      throw new ClaimError((code as ClaimError["code"]) ?? "network");
    }
    return (await res.json()) as T;
  }

  return {
    async getWindow(): Promise<ClaimWindow> {
      const c = await call<{ serverTime: string; opensAt: string; closesAt: string }>("/config");
      return { serverTime: ms(c.serverTime), opensAt: ms(c.opensAt), closesAt: ms(c.closesAt) };
    },
    async getStatus(wallet) {
      return fromWire(await call<WireStatus>(`/status?wallet=${encodeURIComponent(wallet)}`));
    },
    challenge(wallet): Promise<Challenge> {
      return call<Challenge>("/challenge", { method: "POST", body: JSON.stringify({ wallet }) });
    },
    async submit(wallet, nonce, signature) {
      return fromWire(
        await call<WireStatus>("/claim", { method: "POST", body: JSON.stringify({ wallet, nonce, signature }) }),
      );
    },
  };
}
