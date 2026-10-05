/**
 * Address + ABI for the deployed RuxxStaking contract (contracts/src/
 * RuxxStaking.sol). Set the address in .env once deployed:
 *   VITE_STAKING_ADDRESS=0x...
 * Until then the Activate page shows a "staking not live yet" state.
 */

const ZERO = "0x0000000000000000000000000000000000000000" as const;

export const STAKING_ADDRESS = (import.meta.env.VITE_STAKING_ADDRESS || ZERO) as `0x${string}`;
export const STAKING_IS_SET = STAKING_ADDRESS !== ZERO;

/** Lock options in days. Must match RuxxStaking.stake(). */
export const LOCK_DAYS = [7, 14, 30, 60] as const;
export const POINTS_PER_DAY = 500;

export const STAKING_ABI = [
  { type: "function", name: "stake", stateMutability: "nonpayable", inputs: [{ name: "tokenIds", type: "uint256[]" }, { name: "lockDays", type: "uint256" }], outputs: [] },
  { type: "function", name: "unstake", stateMutability: "nonpayable", inputs: [{ name: "tokenIds", type: "uint256[]" }], outputs: [] },
  { type: "function", name: "pointsOf", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256" }] },
  {
    type: "function",
    name: "stakedOf",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "ids", type: "uint256[]" },
      { name: "starts", type: "uint64[]" },
      { name: "unlocks", type: "uint64[]" },
      { name: "earned", type: "uint256[]" },
    ],
  },
] as const;

/** "6d 04h 12m" style countdown. */
export function timeLeft(unlockAt: number, now = Math.floor(Date.now() / 1000)): string {
  const s = unlockAt - now;
  if (s <= 0) return "Unlocked";
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
}
