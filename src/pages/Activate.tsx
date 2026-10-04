import { useEffect, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import { COLLECTION_ADDRESS, COLLECTION_ABI, resolveUri } from "@/lib/collection";
import { ROBINHOOD_CHAIN } from "@/data/chain";
import { Eyes } from "@/components/ui/Icons";

const ZERO_ADDR = "0x0000000000000000000000000000000000000000" as const;

type NftItem = { id: string; image: string | null };

export default function Activate() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [activated, setActivated] = useState(false);

  // Reliable count straight from the collection.
  const { data: balData } = useReadContract({
    address: COLLECTION_ADDRESS,
    abi: COLLECTION_ABI,
    functionName: "balanceOf",
    args: [address ?? ZERO_ADDR],
    query: { enabled: isConnected },
  });
  const balance = balData !== undefined ? Number(balData) : undefined;

  // The wallet's Ruxxells (ids + images) from the Robinhood Chain explorer's
  // NFT index — the collection doesn't expose tokensOfOwner, so we use this.
  const [items, setItems] = useState<NftItem[] | null>(null);
  useEffect(() => {
    if (!isConnected || !address) {
      setItems(null);
      return;
    }
    let stop = false;
    setItems(null);
    const base = ROBINHOOD_CHAIN.blockExplorerUrls[0].replace(/\/$/, "");
    const want = COLLECTION_ADDRESS.toLowerCase();

    (async () => {
      const found: NftItem[] = [];
      let url: string | null = `${base}/api/v2/addresses/${address}/nft?type=ERC-721`;
      let pages = 0;
      try {
        while (url && pages < 8) {
          const res = await fetch(url);
          if (!res.ok) throw new Error("explorer");
          const json: {
            items?: Array<{ id?: string | number; image_url?: string; metadata?: { image?: string }; token?: { address?: string } }>;
            next_page_params?: Record<string, string | number> | null;
          } = await res.json();
          for (const it of json.items ?? []) {
            if ((it.token?.address ?? "").toLowerCase() !== want) continue;
            const img = it.image_url || resolveUri(it.metadata?.image ?? "") || null;
            found.push({ id: String(it.id ?? ""), image: img });
          }
          const npp = json.next_page_params;
          url = npp
            ? `${base}/api/v2/addresses/${address}/nft?type=ERC-721&${new URLSearchParams(
                Object.fromEntries(Object.entries(npp).map(([k, v]) => [k, String(v)])),
              ).toString()}`
            : null;
          pages++;
        }
        if (!stop) setItems(found);
      } catch {
        if (!stop) setItems([]); // fall back to the balanceOf count below
      }
    })();

    return () => {
      stop = true;
    };
  }, [isConnected, address]);

  const loading = isConnected && items === null;
  const count = items && items.length > 0 ? items.length : balance ?? 0;
  const hasNfts = count > 0;

  return (
    <section className="inset section">
      <div className="claim" style={{ maxWidth: 900 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span style={{ display: "inline-flex" }}>
            <Eyes size={18} />
          </span>
          <h1 className="claim__title px" style={{ marginTop: 14 }}>
            ACTIVATE GRID
          </h1>
          <p className="claim__sub" style={{ marginTop: 16, marginInline: "auto", maxWidth: "28em" }}>
            {!isConnected
              ? "Connect your wallet to see your Ruxxells and activate the grid."
              : loading
                ? "Scanning the grid for your Ruxxells…"
                : hasNfts
                  ? "Your Ruxxells are ready. Activate the grid to bring them online."
                  : "No Ruxxells in this wallet."}
          </p>
        </div>

        {!isConnected && (
          <div style={{ display: "grid", justifyItems: "center" }}>
            <button className="btn btn--lime btn--wide" style={{ maxWidth: 420 }} onClick={openConnectModal} disabled={!openConnectModal}>
              Connect Wallet
            </button>
          </div>
        )}

        {isConnected && loading && (
          <p className="note" style={{ textAlign: "center" }}>
            Loading your Ruxxells…
          </p>
        )}

        {isConnected && !loading && hasNfts && (
          <>
            {items && items.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 16 }}>
                {items.map(({ id, image }) => (
                  <div key={id} style={{ border: "2px solid var(--line)", background: "var(--panel)", boxShadow: "6px 6px 0 rgba(0,0,0,0.55)" }}>
                    <div style={{ aspectRatio: "1 / 1", background: "var(--bg)", display: "grid", placeItems: "center", overflow: "hidden" }}>
                      {image ? (
                        <img src={image} alt={`Ruxxell #${id}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                      ) : (
                        <span className="px" style={{ fontSize: 13, color: "var(--faint)" }}>
                          #{id}
                        </span>
                      )}
                    </div>
                    <div style={{ padding: "10px 12px" }}>
                      <span className="mono" style={{ fontSize: 12, color: "var(--lime)" }}>
                        RUXX #{id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="note" style={{ textAlign: "center" }}>
                You hold {count} Ruxxell{count === 1 ? "" : "s"}.
              </p>
            )}

            <div style={{ display: "grid", justifyItems: "center", marginTop: 32, gap: 14 }}>
              {activated ? (
                <div className="banner banner--ok" style={{ textAlign: "center", maxWidth: 480 }}>
                  Operation in progress — wait for update.
                </div>
              ) : (
                <button className="btn btn--lime btn--wide" style={{ maxWidth: 480 }} onClick={() => setActivated(true)}>
                  Activate Grid
                </button>
              )}
              <p className="note" style={{ margin: 0, textAlign: "center" }}>
                {count} Ruxxell{count === 1 ? "" : "s"} in this wallet
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
