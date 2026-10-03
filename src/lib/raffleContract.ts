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
  { type: "function", name: "enter", stateMutability: "nonpayable", inputs: [], outputs: [] },
  // admin — not used by the public claim page, included for tooling/ref
  { type: "function", name: "openEntries", stateMutability: "nonpayable", inputs: [{ type: "uint256" }], outputs: [] },
  { type: "function", name: "distribute", stateMutability: "nonpayable", inputs: [{ type: "uint256" }], outputs: [] },
  { type: "function", name: "sweepUnclaimed", stateMutability: "nonpayable", inputs: [], outputs: [] },
] as const;
