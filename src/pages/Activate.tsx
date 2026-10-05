import { useCallback, useEffect, useMemo, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, usePublicClient, useReadContract, useWriteContract } from "wagmi";
import { COLLECTION_ADDRESS, COLLECTION_ABI, resolveUri } from "@/lib/collection";
import { STAKING_ABI, STAKING_ADDRESS, STAKING_IS_SET, LOCK_DAYS, POINTS_PER_DAY, timeLeft } from "@/lib/stakingContract";
import { ROBINHOOD_CHAIN } from "@/data/chain";
import { Eyes } from "@/components/ui/Icons";

const ZERO_ADDR = "0x0000000000000000000000000000000000000000" as const;

type NftItem = { id: string; image: string | null };
type StakedItem = { id: string; unlock: number; earned: number };

const card = { border: "2px solid var(--line)", background: "var(--panel)", boxShadow: "6px 6px 0 rgba(0,0,0,0.55)" } as const;
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 16 } as const;

export default function Activate() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lockDays, setLockDays] = useState<number>(LOCK_DAYS[0]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 15_000);
    return () => clearInterval(t);
  }, []);

  /* ------------------------------------------------------ wallet NFTs -- */

  const { data: balData } = useReadContract({
    address: COLLECTION_ADDRESS,
    abi: COLLECTION_ABI,
    functionName: "balanceOf",
    args: [address ?? ZERO_ADDR],
    query: { enabled: isConnected },
  });
  const balance = balData !== undefined ? Number(balData) : undefined;

  // The wallet's Ruxxells (ids + images) from the explorer's NFT index.
  const [items, setItems] = useState<NftItem[] | null>(null);
  useEffect(() => {
    if (!isConnected || !address) {
      setItems(null);
      return;
    }
    let stop = false;
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
        if (!stop) setItems([]);
      }
    })();

    return () => {
      stop = true;
    };
  }, [isConnected, address, refresh]);

  /* ------------------------------------------------------------ staking -- */

  const stakingOn = isConnected && STAKING_IS_SET;

  const { data: stakedData, refetch: refetchStaked } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "stakedOf",
    args: [address ?? ZERO_ADDR],
    query: { enabled: stakingOn, refetchInterval: 20_000 },
  });
  const { data: pointsData, refetch: refetchPoints } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "pointsOf",
    args: [address ?? ZERO_ADDR],
    query: { enabled: stakingOn, refetchInterval: 20_000 },
  });
  const { data: approved, refetch: refetchApproval } = useReadContract({
    address: COLLECTION_ADDRESS,
    abi: COLLECTION_ABI,
    functionName: "isApprovedForAll",
    args: [address ?? ZERO_ADDR, STAKING_ADDRESS],
    query: { enabled: stakingOn },
  });

  const staked: StakedItem[] = useMemo(() => {
    if (!stakedData) return [];
    const [ids, , unlocks, earned] = stakedData;
    return ids.map((id, i) => ({ id: id.toString(), unlock: Number(unlocks[i]), earned: Number(earned[i]) }));
  }, [stakedData]);

  // The explorer index can lag right after a stake/unstake, so trust the contract.
  const stakedIds = useMemo(() => new Set(staked.map((s) => s.id)), [staked]);
  const walletItems = useMemo(() => (items ?? []).filter((i) => !stakedIds.has(i.id)), [items, stakedIds]);

  const loading = isConnected && items === null;
  const points = pointsData !== undefined ? Number(pointsData) : 0;
  const unlockedIds = staked.filter((s) => s.unlock <= now).map((s) => s.id);
  const selCount = selected.size;

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const run = useCallback(
    async (label: string, send: () => Promise<`0x${string}`>) => {
      setError(null);
      setBusy(label);
      try {
        const hash = await send();
        await publicClient?.waitForTransactionReceipt({ hash });
        setSelected(new Set());
        setRefresh((n) => n + 1);
        await Promise.all([refetchStaked(), refetchPoints(), refetchApproval()]);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Transaction failed";
        setError(/user rejected|denied/i.test(msg) ? "Transaction cancelled." : "Transaction failed. Check your wallet and try again.");
      } finally {
        setBusy(null);
      }
    },
    [publicClient, refetchStaked, refetchPoints, refetchApproval],
  );

  const approve = () =>
    run("approve", () =>
      writeContractAsync({ address: COLLECTION_ADDRESS, abi: COLLECTION_ABI, functionName: "setApprovalForAll", args: [STAKING_ADDRESS, true] }),
    );

  const stake = () =>
    run("stake", () =>
      writeContractAsync({
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: "stake",
        args: [Array.from(selected).slice(0, 50).map((id) => BigInt(id)), BigInt(lockDays)],
      }),
    );

  const unstake = (ids: string[]) =>
    run("unstake", () =>
      writeContractAsync({
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: "unstake",
        args: [ids.slice(0, 50).map((id) => BigInt(id))],
      }),
    );

  const total = walletItems.length + staked.length;
  const sub = !isConnected
    ? "Connect your wallet to see your Ruxxells and start mining $RUXX Points."
    : !STAKING_IS_SET
      ? "Staking is not live yet."
      : loading
        ? "Scanning the grid for your Ruxxells…"
        : total > 0 || (balance ?? 0) > 0
          ? `Stake a Ruxxell to mine ${POINTS_PER_DAY} $RUXX Points a day.`
          : "No Ruxxells in this wallet.";

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
            {sub}
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

        {stakingOn && !loading && (
          <>
            {/* points */}
            <div className="banner banner--ok" style={{ textAlign: "center", marginBottom: 28 }}>
              <span className="px" style={{ fontSize: 18, color: "var(--lime)" }}>
                {points.toLocaleString()}
              </span>
              <div className="note" style={{ marginTop: 8 }}>
                $RUXX Points · {staked.length} staked · {(staked.length * POINTS_PER_DAY).toLocaleString()}/day
              </div>
            </div>

            {error && (
              <div className="banner" style={{ marginBottom: 20, textAlign: "center" }}>
                {error}
              </div>
            )}

            {/* staked */}
            {staked.length > 0 && (
              <div style={{ marginBottom: 36 }}>
                <h2 className="px" style={{ fontSize: 13, marginBottom: 16 }}>
                  MINING
                </h2>
                <div style={grid}>
                  {staked.map((s) => {
                    const open = s.unlock <= now;
                    return (
                      <div key={s.id} style={card}>
                        <div style={{ padding: "12px" }}>
                          <div className="mono" style={{ fontSize: 12, color: "var(--lime)" }}>
                            RUXX #{s.id}
                          </div>
                          <div className="note" style={{ margin: "8px 0" }}>
                            {s.earned.toLocaleString()} pts
                          </div>
                          <div className="mono" style={{ fontSize: 12, color: "var(--mute)" }}>
                            {open ? "Unlocked" : timeLeft(s.unlock, now)}
                          </div>
                          {open && (
                            <button className="btn btn--ghost btn--sm btn--wide" style={{ marginTop: 10 }} disabled={!!busy} onClick={() => unstake([s.id])}>
                              Unstake
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {unlockedIds.length > 1 && (
                  <div style={{ display: "grid", justifyItems: "center", marginTop: 20 }}>
                    <button className="btn btn--ghost btn--wide" style={{ maxWidth: 480 }} disabled={!!busy} onClick={() => unstake(unlockedIds)}>
                      {busy === "unstake" ? "Unstaking…" : `Unstake all unlocked (${unlockedIds.length})`}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* wallet */}
            {walletItems.length > 0 && (
              <>
                <h2 className="px" style={{ fontSize: 13, marginBottom: 16 }}>
                  IN YOUR WALLET
                </h2>
                <div style={grid}>
                  {walletItems.map(({ id, image }) => {
                    const on = selected.has(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggle(id)}
                        aria-pressed={on}
                        style={{ ...card, padding: 0, cursor: "pointer", textAlign: "left", borderColor: on ? "var(--lime)" : "var(--line)" }}
                      >
                        <div style={{ aspectRatio: "1 / 1", background: "var(--bg)", display: "grid", placeItems: "center", overflow: "hidden" }}>
                          {image ? (
                            <img src={image} alt={`Ruxxell #${id}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                          ) : (
                            <span className="px" style={{ fontSize: 13, color: "var(--faint)" }}>
                              #{id}
                            </span>
                          )}
                        </div>
                        <div style={{ padding: "10px 12px", display: "flex", justifyContent: "space-between" }}>
                          <span className="mono" style={{ fontSize: 12, color: "var(--lime)" }}>
                            RUXX #{id}
                          </span>
                          <span className="mono" style={{ fontSize: 12, color: on ? "var(--lime)" : "var(--faint)" }}>
                            {on ? "✓" : "○"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* lock + stake */}
                <div style={{ display: "grid", justifyItems: "center", marginTop: 32, gap: 14 }}>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                    {LOCK_DAYS.map((d) => (
                      <button key={d} type="button" className={`btn btn--sm ${lockDays === d ? "btn--lime" : "btn--ghost"}`} onClick={() => setLockDays(d)}>
                        {d} days
                      </button>
                    ))}
                  </div>

                  {approved === false ? (
                    <button className="btn btn--lime btn--wide" style={{ maxWidth: 480 }} disabled={!!busy} onClick={approve}>
                      {busy === "approve" ? "Approving…" : "Approve staking"}
                    </button>
                  ) : (
                    <button className="btn btn--lime btn--wide" style={{ maxWidth: 480 }} disabled={!!busy || selCount === 0 || approved === undefined} onClick={stake}>
                      {busy === "stake" ? "Staking…" : selCount === 0 ? "Select Ruxxells to stake" : `Stake ${selCount} for ${lockDays} days`}
                    </button>
                  )}

                  <p className="note" style={{ margin: 0, textAlign: "center" }}>
                    {selCount > 0
                      ? `${(selCount * POINTS_PER_DAY).toLocaleString()} points/day · ${(selCount * POINTS_PER_DAY * lockDays).toLocaleString()} over ${lockDays} days. Locked until then.`
                      : "Staked Ruxxells are locked in the contract until the lock ends."}
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
