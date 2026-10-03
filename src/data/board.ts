/**
 * The Board: what the crew is watching.
 *
 * Quotes come from DexScreener's public API. For each token it takes the
 * pair with the most liquidity on the given chain. If the site should show a
 * specific pool instead, add `pair` (the pool address) and that pool is used.
 *
 * CONFIRM THESE: the contract addresses below are the main Solana listings
 * and should be checked against the pairs you want on the site.
 */
export type BoardToken = {
  symbol: string;
  name: string;
  chain: string;
  address: string;
  pair?: string;
};

export const BOARD: BoardToken[] = [
  { symbol: "$WIF", name: "dogwifhat", chain: "solana", address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm" },
  { symbol: "BONK", name: "Bonk", chain: "solana", address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" },
  { symbol: "POPCAT", name: "Popcat", chain: "solana", address: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr" },
];

export const BOARD_REFRESH_MS = 60_000;
