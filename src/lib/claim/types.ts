/**
 * Contract between the claim page and the claim backend.
 * All times are epoch milliseconds in the client; the HTTP layer converts
 * from the ISO strings the backend sends.
 */

export type ClaimStatus =
  /** Wallet is not on the FREE list. */
  | { state: "none" }
  /** On the list, nothing submitted yet. */
  | { state: "eligible" }
  /** Accepted by the backend. Per-user 3:00 timer runs to `deliverAt`. */
  | { state: "processing"; acceptedAt: number; deliverAt: number }
  /** Transaction sent (or due) but not yet confirmed onchain. */
  | { state: "finalizing"; acceptedAt: number; txHash?: string }
  /** Confirmed onchain. */
  | { state: "complete"; txHash: string; tokenId?: string };

export type ClaimWindow = {
  /** Server clock at the moment config was fetched. */
  serverTime: number;
  opensAt: number;
  closesAt: number;
};

export type Challenge = { message: string; nonce: string };

export type ClaimErrorCode =
  | "not_open"
  | "closed"
  | "not_eligible"
  | "already_claimed"
  | "bad_signature"
  | "rejected"
  | "network";

export class ClaimError extends Error {
  code: ClaimErrorCode;
  constructor(code: ClaimErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

export interface ClaimApi {
  getWindow(): Promise<ClaimWindow>;
  getStatus(wallet: string): Promise<ClaimStatus>;
  /** Server-issued message + nonce for the wallet to sign. */
  challenge(wallet: string): Promise<Challenge>;
  /** Backend verifies the signature, checks the window with ITS clock, and accepts. */
  submit(wallet: string, nonce: string, signature: string): Promise<ClaimStatus>;
}

export const ERROR_COPY: Record<ClaimErrorCode, string> = {
  not_open: "Claiming has not opened yet.",
  closed: "FREE claiming has closed. This claim was not accepted.",
  not_eligible: "There is no FREE claim associated with this wallet.",
  already_claimed: "This wallet has already claimed.",
  bad_signature: "The signature could not be verified. Try again.",
  rejected: "You declined the signature request. Nothing was claimed.",
  network: "Could not reach the claim server. Check your connection and try again.",
};
