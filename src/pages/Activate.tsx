import { useCallback, useEffect, useMemo, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, usePublicClient, useReadContract, useWriteContract } from "wagmi";
import { COLLECTION_ADDRESS, COLLECTION_ABI } from "@/lib/collection";
import { loadOwnedNfts, type NftItem } from "@/lib/collectionNfts";
import { STAKING_ABI, STAKING_ADDRESS, STAKING_IS_SET, LOCK_DAYS, POINTS_PER_DAY } from "@/lib/stakingContract";
import { Eyes } from "@/components/ui/Icons";
import LockPicker from "@/components/staking/LockPicker";
import StakeCard from "@/components/staking/StakeCard";

const ZERO_ADDR = "0x0000000000000000000000000000000000000000" as const;

type StakedItem = { id: string; start: number; unlock: number };

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
    loadOwnedNfts(publicClient, address)
      .then((found) => !stop && setItems(found))
      .catch(() => !stop && setItems([]));
    return () => {
      stop = true;
    };
  }, [isConnected, address, refresh, publicClient]);

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
    const [ids, starts, unlocks] = stakedData;
    return ids.map((id, i) => ({ id: id.toString(), start: Number(starts[i]), unlock: Number(unlocks[i]) }));
  }, [stakedData]);

  // The explorer index can lag right after a stake/unstake, so trust the contract.
  const stakedIds = useMemo(() => new Set(staked.map((s) => s.id)), [staked]);
  const walletItems = useMemo(() => (items ?? []).filter((i) => !stakedIds.has(i.id)), [items, stakedIds]);

  // Staked NFTs sit in the contract, so read their art from the contract's holdings.
  const [stakedArt, setStakedArt] = useState<Record<string, string | null>>({});
  const stakedKey = staked.map((x) => x.id).join(",");
  useEffect(() => {
    if (!stakingOn || stakedKey === "") return;
    let stop = false;
    loadOwnedNfts(publicClient, STAKING_ADDRESS)
      .then((found) => !stop && setStakedArt(Object.fromEntries(found.map((n) => [n.id, n.image]))))
      .catch(() => {});
    return () => {
      stop = true;
    };
  }, [stakingOn, stakedKey, publicClient]);

  const loading = isConnected && items === null;
  const points = pointsData !== undefined ? Number(pointsData) : 0;
  const unlockedIds = staked.filter((x) => x.unlock <= now).map((x) => x.id);
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
                <div className="stakelist">
                  {staked.map((x) => (
                    <StakeCard
                      key={x.id}
                      stake={{ id: x.id, image: stakedArt[x.id] ?? null, start: x.start, unlock: x.unlock }}
                      busy={!!busy}
                      onUnstake={() => unstake([x.id])}
                    />
                  ))}
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
                  <LockPicker value={lockDays} onChange={setLockDays} />

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
