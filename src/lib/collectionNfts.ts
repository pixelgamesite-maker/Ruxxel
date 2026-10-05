import { parseAbiItem } from "viem";
import { COLLECTION_ADDRESS, COLLECTION_ABI, resolveUri } from "@/lib/collection";
import { ROBINHOOD_CHAIN } from "@/data/chain";

/** What wagmi's usePublicClient returns (typed loosely on purpose). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Reader = {
  readContract: (args: any) => Promise<unknown>;
  getLogs: (args: any) => Promise<any[]>;
  getBlockNumber: () => Promise<bigint>;
};

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

const GATEWAYS = ["https://ipfs.io/ipfs/", "https://dweb.link/ipfs/", "https://gateway.pinata.cloud/ipfs/"];

function candidates(uri: string): string[] {
  if (uri.startsWith("ipfs://")) {
    const path = uri.slice(7).replace(/^ipfs\//, "");
    return GATEWAYS.map((g) => g + path);
  }
  return [uri];
}

async function fetchJson(urls: string[]): Promise<{ image?: string; image_url?: string }> {
  let last: unknown;
  for (const url of urls) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);
      if (res.ok) return await res.json();
      last = new Error(String(res.status));
    } catch (e) {
      last = e;
    }
  }
  throw last;
}

/** Art for one token, read from its tokenURI metadata (tries several IPFS gateways). Null on failure. */
export async function fetchTokenImage(client: Reader, id: string): Promise<string | null> {
  try {
    const uri = (await client.readContract({
      address: COLLECTION_ADDRESS,
      abi: COLLECTION_ABI,
      functionName: "tokenURI",
      args: [BigInt(id)],
    })) as string;
    let json: { image?: string; image_url?: string };
    if (uri.startsWith("data:application/json;base64,")) {
      json = JSON.parse(atob(uri.split(",")[1]));
    } else if (uri.startsWith("data:application/json,")) {
      json = JSON.parse(decodeURIComponent(uri.split(",")[1]));
    } else {
      json = await fetchJson(candidates(uri));
    }
    return resolveUri(json.image ?? json.image_url ?? "") || null;
  } catch {
    return null;
  }
}

/** Art for several tokens at once: { [tokenId]: url | null }. */
export async function loadImages(client: Reader, ids: string[]): Promise<Record<string, string | null>> {
  const entries = await Promise.all(ids.map(async (id) => [id, await fetchTokenImage(client, id)] as const));
  return Object.fromEntries(entries);
}

/**
 * Same approach the BoyMeetsHood app uses: scan the collection's Transfer logs
 * with `to = owner`, then keep only tokens `ownerOf` still says the owner holds.
 * Needs no indexer and no enumerable extension. Set VITE_COLLECTION_FROM_BLOCK
 * to the collection's deploy block to make the scan faster.
 */
const TRANSFER_EVENT = parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)");
const FROM_BLOCK = BigInt(import.meta.env.VITE_COLLECTION_FROM_BLOCK || 0);
const MAX_RANGE = 9_000_000n; // the RPC caps eth_getLogs at 10M blocks per request

async function idsByTransferLogs(client: Reader, owner: `0x${string}`): Promise<string[]> {
  const latest = await client.getBlockNumber();
  const windows: Array<[bigint, bigint]> = [];
  for (let start = FROM_BLOCK; start <= latest; start += MAX_RANGE + 1n) {
    windows.push([start, start + MAX_RANGE > latest ? latest : start + MAX_RANGE]);
  }
  const chunks = await Promise.all(
    windows.map(([fromBlock, toBlock]) =>
      client.getLogs({ address: COLLECTION_ADDRESS, event: TRANSFER_EVENT, args: { to: owner }, fromBlock, toBlock }),
    ),
  );
  const candidates = [...new Set(chunks.flat().map((l: { args: { tokenId?: bigint } }) => (l.args.tokenId as bigint).toString()))];

  const owners = await Promise.all(
    candidates.map((id) =>
      client
        .readContract({ address: COLLECTION_ADDRESS, abi: COLLECTION_ABI, functionName: "ownerOf", args: [BigInt(id)] })
        .then((o) => String(o).toLowerCase())
        .catch(() => ""),
    ),
  );
  return candidates.filter((_, i) => owners[i] === owner.toLowerCase()).sort((a, b) => Number(a) - Number(b));
}

/**
 * Ruxxells held by `owner`: ids from Transfer logs (falling back to
 * tokensOfOwner, then the explorer), art from the explorer when it has it,
 * otherwise from each token's metadata.
 */
export async function loadOwnedNfts(client: Reader | undefined, owner: string): Promise<NftItem[]> {
  const addr = owner as `0x${string}`;
  const explorerP = fetchCollectionNfts(owner).catch(() => [] as NftItem[]);
  if (!client) return explorerP;

  let ids: string[] | null = null;
  try {
    ids = await idsByTransferLogs(client, addr);
  } catch {
    try {
      const raw = (await client.readContract({ address: COLLECTION_ADDRESS, abi: COLLECTION_ABI, functionName: "tokensOfOwner", args: [addr] })) as readonly bigint[];
      ids = raw.map((n) => n.toString());
    } catch {
      ids = null;
    }
  }
  const explorer = await explorerP;
  if (ids === null) return explorer;

  const art = new Map(explorer.map((n) => [n.id, n.image]));
  return Promise.all(ids.map(async (id) => ({ id, image: art.get(id) ?? (await fetchTokenImage(client, id)) })));
}
