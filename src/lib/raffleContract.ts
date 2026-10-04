/**
 * Address + ABI for the deployed RuxxellsRaffle contract (contracts/src/
 * RuxxellsRaffle.sol). Set the address in .env once deployed:
 *   VITE_RAFFLE_ADDRESS=0x...
 * Until then it falls back to the zero address and the claim page shows a
 * "not live yet" state instead of erroring.
 */

const ZERO = "0x0000000000000000000000000000000000000000" as const;

export const RAFFLE_ADDRESS = (import.meta.env.VITE_RAFFLE_ADDRESS || ZERO) as `0x${string}`;

export const RAFFLE_IS_SET = RAFFLE_ADDRESS !== ZERO;

/** Planned claim supply, shown on the claim page. */
export const CLAIM_SUPPLY = 320;

/**
 * Scheduled open time — informational only. The claim truly opens when the
 * admin calls openEntries; this just drives the pre-open countdown and is
 * shown in each visitor's OWN local timezone (like a Discord timestamp).
 * Edit this to the real open time. Must be a UTC instant (the trailing Z).
 */
export const CLAIM_OPENS_AT = new Date("2026-10-04T16:00:00Z");

/**
 * "Share on X" after a completed claim. To make it quote your "mint is live"
 * tweet, paste that tweet's URL into `quoteUrl` — X renders it as a quote.
 * Leave quoteUrl empty for a plain post.
 */
export const SHARE = {
  text: "I just claimed my Ruxxell. The grid is live. gm.",
  quoteUrl: "",
};

export function shareUrl(): string {
  const params = new URLSearchParams({ text: SHARE.text });
  if (SHARE.quoteUrl) params.set("url", SHARE.quoteUrl);
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

/**
 * Human-readable-free ABI (typed object form, like the Shuffler reference) so
 * wagmi infers return types. Only the surface the claim page needs, plus the
 * admin calls for completeness.
 */
export const RAFFLE_ABI = [
  { type: "function", name: "isOpen", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { type: "function", name: "entryDeadline", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "depositedCount", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "entrantsCount", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "remainingToDistribute", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "unclaimedCount", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "nextToDistribute", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "swept", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { type: "function", name: "owner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "hasEntered", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "distributed", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "merkleRoot", stateMutability: "view", inputs: [], outputs: [{ type: "bytes32" }] },
  { type: "function", name: "isEligible", stateMutability: "view", inputs: [{ type: "address" }, { type: "bytes32[]" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "enter", stateMutability: "nonpayable", inputs: [{ type: "bytes32[]", name: "proof" }], outputs: [] },
  // admin — used by the /admin page
  { type: "function", name: "setMerkleRoot", stateMutability: "nonpayable", inputs: [{ type: "bytes32" }], outputs: [] },
  { type: "function", name: "openEntries", stateMutability: "nonpayable", inputs: [{ type: "uint256" }], outputs: [] },
  { type: "function", name: "distribute", stateMutability: "nonpayable", inputs: [{ type: "uint256" }], outputs: [] },
  { type: "function", name: "sweepUnclaimed", stateMutability: "nonpayable", inputs: [], outputs: [] },
] as const;
