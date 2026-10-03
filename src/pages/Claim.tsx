import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { RAFFLE_ADDRESS, RAFFLE_ABI, RAFFLE_IS_SET } from "@/lib/raffleContract";
import { CLAIM, ROBINHOOD_CHAIN } from "@/data/chain";

function fmtHMS(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

export default function Claim() {
  const { address, isConnected } = useAccount();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Batched raffle state — refetched every 15s so the UI stays live as other
  // wallets enter and as the window / distribution progresses.
  const raffle = { address: RAFFLE_ADDRESS, abi: RAFFLE_ABI } as const;
  const { data, refetch } = useReadContracts({
    contracts: [
      { ...raffle, functionName: "entryDeadline" },
      { ...raffle, functionName: "isOpen" },
      { ...raffle, functionName: "depositedCount" },
      { ...raffle, functionName: "entrantsCount" },
      { ...raffle, functionName: "remainingToDistribute" },
      { ...raffle, functionName: "swept" },
    ],
    query: { enabled: RAFFLE_IS_SET, refetchInterval: 15000 },
  });

  const entryDeadline = data?.[0]?.result as bigint | undefined;
  const isOpen = data?.[1]?.result as boolean | undefined;
  const deposited = data?.[2]?.result as bigint | undefined;
  const entrants = data?.[3]?.result as bigint | undefined;
  const remaining = data?.[4]?.result as bigint | undefined;
  const swept = data?.[5]?.result as boolean | undefined;

  const { data: enteredData, refetch: refetchEntered } = useReadContracts({
    contracts: [{ ...raffle, functionName: "hasEntered", args: [address ?? "0x0000000000000000000000000000000000000000"] }],
    query: { enabled: RAFFLE_IS_SET && isConnected },
  });
  const hasEntered = enteredData?.[0]?.result as boolean | undefined;

  const enterWrite = useWriteContract();
  const enterReceipt = useWaitForTransactionReceipt({ hash: enterWrite.data });

  // Once an entry confirms, pull fresh counts + entered status.
  useEffect(() => {
    if (enterReceipt.isSuccess) {
      refetch();
      refetchEntered();
    }
  }, [enterReceipt.isSuccess, refetch, refetchEntered]);

  function enter() {
    enterWrite.reset();
    enterWrite.writeContract({ address: RAFFLE_ADDRESS, abi: RAFFLE_ABI, functionName: "enter" });
  }

  // ---- derive a single phase for the window --------------------------------
  const deadlineMs = entryDeadline !== undefined ? Number(entryDeadline) * 1000 : 0;
  const notOpenedYet = entryDeadline !== undefined && entryDeadline === 0n;
  const windowOpen = isOpen === true;
  const closed = entryDeadline !== undefined && entryDeadline !== 0n && !windowOpen;
  const slotsFull = deposited !== undefined && entrants !== undefined && entrants >= deposited;
  const remainingMs = deadlineMs - now;

  // ---- entry button state --------------------------------------------------
  let label = "Connect wallet";
  let disabled = false;
  let onClick: (() => void) | undefined;

  if (!RAFFLE_IS_SET) {
    label = "Not live yet";
    disabled = true;
  } else if (!isConnected) {
    // ConnectButton below handles the actual connect; this is just a hint.
    label = "Connect wallet to enter";
    disabled = true;
  } else if (notOpenedYet) {
    label = "Entries not open yet";
    disabled = true;
  } else if (hasEntered) {
    label = "You're in ✓";
    disabled = true;
  } else if (closed) {
    label = "Entries closed";
    disabled = true;
  } else if (slotsFull) {
    label = "Raffle full";
    disabled = true;
  } else if (enterWrite.isPending) {
    label = "Confirm in wallet…";
    disabled = true;
  } else if (enterReceipt.isLoading) {
    label = "Entering…";
    disabled = true;
  } else if (windowOpen) {
    label = "Enter raffle";
    onClick = enter;
  }

  // ---- countdown strip copy ------------------------------------------------
  const strip = notOpenedYet
    ? { k: "Entries open soon", t: "--:--:--" }
    : windowOpen
      ? { k: "Entries close in", t: fmtHMS(remainingMs) }
      : { k: "Entries closed", t: "00:00:00" };

  const errMsg =
    (enterWrite.error as { shortMessage?: string } | null)?.shortMessage ??
    (enterReceipt.error as { shortMessage?: string } | null)?.shortMessage;

  return (
    <section className="band" style={{ paddingTop: "clamp(90px, 10vw, 140px)" }}>
      <div className="wrap wrap--text">
        <div className="head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div>
            <span className="mono">Raffle</span>
            <h2>{CLAIM.label}</h2>
            <p>
              Connect your wallet and enter. If you're eligible you're in — every entrant is guaranteed one
              Ruxxell. Entries run for a fixed window on {ROBINHOOD_CHAIN.name}; once it closes, NFTs are
              distributed to everyone who entered.
            </p>
          </div>
          <ConnectButton showBalance={false} chainStatus="icon" />
        </div>

        <div>
          <div
            style={{
              background: "var(--glass)",
              borderRadius: "var(--r-lg)",
              boxShadow: "var(--shadow)",
              padding: "26px",
              display: "grid",
              gap: "18px",
            }}
          >
            {/* countdown strip */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 18px",
                borderRadius: "var(--r-md, 12px)",
                background: windowOpen ? "rgba(57,224,122,0.1)" : "var(--ink-3, rgba(255,255,255,0.04))",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <span className="mono" style={{ color: windowOpen ? "var(--green)" : "var(--mute)" }}>
                {strip.k}
              </span>
              <time className="mono" style={{ fontSize: "1.3rem", fontWeight: 700, letterSpacing: "0.04em" }}>
                {strip.t}
              </time>
            </div>

            <dl className="miner__kv" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
              <div>
                <dt>Prizes</dt>
                <dd>{deposited !== undefined ? deposited.toString() : "—"}</dd>
              </div>
              <div>
                <dt>Entrants</dt>
                <dd>{entrants !== undefined ? entrants.toString() : "—"}</dd>
              </div>
              <div>
                <dt>Spots left</dt>
                <dd>
                  {deposited !== undefined && entrants !== undefined
                    ? (deposited > entrants ? (deposited - entrants).toString() : "0")
                    : "—"}
                </dd>
              </div>
            </dl>

            {hasEntered && (
              <div className="banner" style={{ background: "rgba(57,224,122,0.14)", color: "var(--green)" }}>
                You're entered. {closed
                  ? swept || (remaining !== undefined && remaining === 0n)
                    ? "Distribution is complete — check your wallet."
                    : "Entries are closed. Your Ruxxell is sent when the team runs distribution."
                  : "Keep this wallet connected — your Ruxxell arrives after the window closes."}
              </div>
            )}

            {errMsg && <div className="banner banner--err">{errMsg}</div>}

            <button
              className="btn btn--wide btn--xl"
              onClick={onClick}
              disabled={disabled || onClick === undefined}
            >
              {label}
            </button>

            <p className="note">
              Raffle contract: <span className="mono">{RAFFLE_IS_SET ? `${RAFFLE_ADDRESS.slice(0, 6)}…${RAFFLE_ADDRESS.slice(-4)}` : "not deployed"}</span> on{" "}
              {ROBINHOOD_CHAIN.name} (chain id {ROBINHOOD_CHAIN.chainId}). Entering costs only gas — there's no
              entry fee.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
