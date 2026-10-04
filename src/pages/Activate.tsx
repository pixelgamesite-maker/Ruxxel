import { useEffect, useMemo, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { COLLECTION_ADDRESS, COLLECTION_ABI, resolveUri } from "@/lib/collection";
import { Eyes } from "@/components/ui/Icons";

const ZERO_ADDR = "0x0000000000000000000000000000000000000000" as const;

export default function Activate() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [activated, setActivated] = useState(false);

  const collection = { address: COLLECTION_ADDRESS, abi: COLLECTION_ABI } as const;

  // All tokenIds this wallet holds (ERC721A-Queryable, one call).
  const { data: ownedData, isLoading: loadingIds } = useReadContract({
    ...collection,
    functionName: "tokensOfOwner",
    args: [address ?? ZERO_ADDR],
    query: { enabled: isConnected },
  });
  const tokenIds = useMemo(() => (ownedData as bigint[] | undefined) ?? [], [ownedData]);

  // tokenURI for each owned token, to pull images.
  const { data: uriData } = useReadContracts({
    contracts: tokenIds.map((id) => ({ ...collection, functionName: "tokenURI" as const, args: [id] })),
    query: { enabled: tokenIds.length > 0 },
  });

  // Resolve each tokenURI -> metadata JSON -> image url (best effort).
  const [images, setImages] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!uriData) return;
    let stop = false;
    uriData.forEach((res, i) => {
      const uri = res?.result as string | undefined;
      const id = tokenIds[i]?.toString();
      if (!uri || !id) return;
      fetch(resolveUri(uri))
        .then((r) => (r.ok ? r.json() : null))
        .then((meta) => {
          if (stop || !meta?.image) return;
          setImages((prev) => ({ ...prev, [id]: resolveUri(meta.image) }));
        })
        .catch(() => undefined);
    });
    return () => {
      stop = true;
    };
  }, [uriData, tokenIds]);

  const count = tokenIds.length;

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
            {isConnected
              ? count > 0
                ? "Your Ruxxells are ready. Activate the grid to bring them online."
                : "No Ruxxells in this wallet."
              : "Connect your wallet to see your Ruxxells and activate the grid."}
          </p>
        </div>

        {!isConnected && (
          <div style={{ display: "grid", justifyItems: "center" }}>
            <button className="btn btn--lime btn--wide" style={{ maxWidth: 420 }} onClick={openConnectModal} disabled={!openConnectModal}>
              Connect Wallet
            </button>
          </div>
        )}

        {isConnected && loadingIds && (
          <p className="note" style={{ textAlign: "center" }}>
            Loading your Ruxxells…
          </p>
        )}

        {isConnected && !loadingIds && count > 0 && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: 16,
              }}
            >
              {tokenIds.map((id) => {
                const key = id.toString();
                const img = images[key];
                return (
                  <div
                    key={key}
                    style={{
                      border: "2px solid var(--line)",
                      background: "var(--panel)",
                      boxShadow: "6px 6px 0 rgba(0,0,0,0.55)",
                    }}
                  >
                    <div style={{ aspectRatio: "1 / 1", background: "var(--bg)", display: "grid", placeItems: "center", overflow: "hidden" }}>
                      {img ? (
                        <img src={img} alt={`Ruxxell #${key}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                      ) : (
                        <span className="px" style={{ fontSize: 13, color: "var(--faint)" }}>
                          #{key}
                        </span>
                      )}
                    </div>
                    <div style={{ padding: "10px 12px" }}>
                      <span className="mono" style={{ fontSize: 12, color: "var(--lime)" }}>
                        RUXX #{key}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

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
