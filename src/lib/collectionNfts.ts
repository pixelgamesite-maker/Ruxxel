import { COLLECTION_ADDRESS, COLLECTION_ABI, resolveUri } from "@/lib/collection";
import { ROBINHOOD_CHAIN } from "@/data/chain";

/** Anything with viem's readContract (what wagmi's usePublicClient returns). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Reader = { readContract: (args: any) => Promise<unknown> };

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

/** Art for one token, read from its tokenURI metadata. Null if anything fails. */
export async function fetchTokenImage(client: Reader, id: string): Promise<string | null> {
  try {
    const uri = (await client.readContract({
      address: COLLECTION_ADDRESS,
      abi: COLLECTION_ABI,
      functionName: "tokenURI",
      args: [BigInt(id)],
    })) as string;
    let json: { image?: string };
    if (uri.startsWith("data:application/json;base64,")) {
      json = JSON.parse(atob(uri.slice("data:application/json;base64,".length)));
    } else {
      const res = await fetch(resolveUri(uri));
      if (!res.ok) return null;
      json = await res.json();
    }
    return resolveUri(json.image ?? "") || null;
  } catch {
    return null;
  }
}

/**
 * Ruxxells held by `owner`. Token ids come from the collection contract itself
 * (tokensOfOwner), so they never depend on an indexer. Art comes from the
 * explorer when it has it, otherwise from each token's metadata. If the
 * on-chain call isn't available, falls back to the explorer's list.
 */
export async function loadOwnedNfts(client: Reader | undefined, owner: string): Promise<NftItem[]> {
  let explorer: NftItem[] = [];
  try {
    explorer = await fetchCollectionNfts(owner);
  } catch {
    /* explorer is optional */
  }
  if (!client) return explorer;

  let ids: string[];
  try {
    const raw = (await client.readContract({
      address: COLLECTION_ADDRESS,
      abi: COLLECTION_ABI,
      functionName: "tokensOfOwner",
      args: [owner as `0x${string}`],
    })) as readonly bigint[];
    ids = raw.map((n) => n.toString());
  } catch {
    return explorer;
  }

  const art = new Map(explorer.map((n) => [n.id, n.image]));
  return Promise.all(ids.map(async (id) => ({ id, image: art.get(id) ?? (await fetchTokenImage(client, id)) })));
}
