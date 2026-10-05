import { COLLECTION_ADDRESS, resolveUri } from "@/lib/collection";
import { ROBINHOOD_CHAIN } from "@/data/chain";

export type NftItem = { id: string; image: string | null };

type ExplorerPage = {
  items?: Array<{ id?: string | number; image_url?: string; metadata?: { image?: string }; token?: { address?: string } }>;
  next_page_params?: Record<string, string | number> | null;
};

/**
 * Every Ruxxell held by `owner` (a wallet or the staking contract), with art,
 * from the Robinhood Chain explorer's NFT index. Throws if the explorer fails.
 */
export async function fetchCollectionNfts(owner: string): Promise<NftItem[]> {
  const base = ROBINHOOD_CHAIN.blockExplorerUrls[0].replace(/\/$/, "");
  const want = COLLECTION_ADDRESS.toLowerCase();
  const found: NftItem[] = [];
  let url: string | null = `${base}/api/v2/addresses/${owner}/nft?type=ERC-721`;
  let pages = 0;

  while (url && pages < 8) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("explorer");
    const json: ExplorerPage = await res.json();
    for (const it of json.items ?? []) {
      if ((it.token?.address ?? "").toLowerCase() !== want) continue;
      const img = it.image_url || resolveUri(it.metadata?.image ?? "") || null;
      found.push({ id: String(it.id ?? ""), image: img });
    }
    const npp = json.next_page_params;
    url = npp
      ? `${base}/api/v2/addresses/${owner}/nft?type=ERC-721&${new URLSearchParams(
          Object.fromEntries(Object.entries(npp).map(([k, v]) => [k, String(v)])),
        ).toString()}`
      : null;
    pages++;
  }
  return found;
}
