/** The live Ruxxells NFT collection on Robinhood Chain. */
export const COLLECTION_ADDRESS = "0xec58af19a910f73f3ea50de685967cf93ea00b54" as const;

/**
 * Minimal read surface. `tokensOfOwner` is the ERC721A-Queryable extension
 * that OpenSea's SeaDrop collections expose — it returns every tokenId a
 * wallet holds in one call, so we don't need an external indexer.
 */
export const COLLECTION_ABI = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "tokensOfOwner", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "uint256[]" }] },
  { type: "function", name: "tokenURI", stateMutability: "view", inputs: [{ type: "uint256" }], outputs: [{ type: "string" }] },
] as const;

/** Resolve an ipfs:// (or bare CID) URI to an https gateway URL. */
export function resolveUri(uri: string): string {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) return `https://ipfs.io/ipfs/${uri.slice(7)}`;
  return uri;
}
