import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useConnectModal, useChainModal, useAccountModal } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { RAFFLE_ADDRESS, RAFFLE_ABI, RAFFLE_IS_SET, shareUrl, CLAIM_OPENS_AT } from "@/lib/raffleContract";
import { ROBINHOOD_CHAIN } from "@/data/chain";

const ZERO_ADDR = "0x0000000000000000000000000000000000000000" as const;

type Allowlist = { root: string; count: number; proofs: Record<string, `0x${string}`[]> };

function proofFor(allowlist: Allowlist | null, address?: string): `0x${string}`[] | null {
  if (!allowlist || !address) return null;
  const direct = allowlist.proofs[address];
  if (direct) return direct;
  const lower = address.toLowerCase();
  for (const [k, v] of Object.entries(allowlist.proofs)) {
    if (k.toLowerCase() === lower) return v;
  }
  return null;
}

function fmtHMS(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

/** Countdown that also shows days when more than 24h out. */
function fmtCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const pad = (n: number) => String(n).padStart(2, "0");
  const hms = `${pad(Math.floor((s % 86400) / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  return d > 0 ? `${d}d ${hms}` : hms;
}

/** The scheduled open time in the VIEWER's own local timezone (Discord-style). */
const LOCAL_OPEN_TIME = CLAIM_OPENS_AT.toLocaleString(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
});

export default function Claim() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();
  const { openAccountModal } = useAccountModal();

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const contract = { address: RAFFLE_ADDRESS, abi: RAFFLE_ABI } as const;
  const { data, refetch } = useReadContracts({
    contracts: [
      { ...contract, functionName: "entryDeadline" },
      { ...contract, functionName: "isOpen" },
      { ...contract, functionName: "depositedCount" },
      { ...contract, functionName: "entrantsCount" },
    ],
    query: { enabled: RAFFLE_IS_SET, refetchInterval: 15000 },
  });

  const entryDeadline = data?.[0]?.result as bigint | undefined;
  const isOpen = data?.[1]?.result as boolean | undefined;
  const deposited = data?.[2]?.result as bigint | undefined;
  const entrants = data?.[3]?.result as bigint | undefined;

  const { data: enteredData, refetch: refetchEntered } = useReadContracts({
    contracts: [
      { ...contract, functionName: "hasEntered", args: [address ?? ZERO_ADDR] },
      { ...contract, functionName: "distributed", args: [address ?? ZERO_ADDR] },
    ],
    query: { enabled: RAFFLE_IS_SET && isConnected, refetchInterval: 15000 },
  });
  const hasEntered = enteredData?.[0]?.result as boolean | undefined;
  const distributedToMe = enteredData?.[1]?.result as boolean | undefined;

  const [allowlist, setAllowlist] = useState<Allowlist | null>(null);
  const [allowlistLoaded, setAllowlistLoaded] = useState(false);
  useEffect(() => {
    let stop = false;
    fetch("/allowlist.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (stop) return;
        setAllowlist(j && j.proofs ? (j as Allowlist) : null);
        setAllowlistLoaded(true);
      })
      .catch(() => !stop && setAllowlistLoaded(true));
    return () => {
      stop = true;
    };
  }, []);

  const proof = useMemo(() => proofFor(allowlist, address ?? undefined), [allowlist, address]);
  const eligible = proof !== null;

  const claimWrite = useWriteContract();
  const claimReceipt = useWaitForTransactionReceipt({ hash: claimWrite.data });
  useEffect(() => {
    if (claimReceipt.isSuccess) {
      refetch();
      refetchEntered();
    }
  }, [claimReceipt.isSuccess, refetch, refetchEntered]);

  function claim() {
    if (!proof) return;
    claimWrite.reset();
    claimWrite.writeContract({ ...contract, functionName: "enter", args: [proof] });
  }

  // ---- window phase (global) ----------------------------------------------
  const notOpenedYet = !RAFFLE_IS_SET || entryDeadline === undefined || entryDeadline === 0n;
  const windowOpen = isOpen === true;
  const closed = entryDeadline !== undefined && entryDeadline !== 0n && !windowOpen;
  const remainingMs = entryDeadline !== undefined ? Number(entryDeadline) * 1000 - now : 0;

  // Pre-open: count down to the scheduled open time (informational).
  const opensInMs = CLAIM_OPENS_AT.getTime() - now;
  const countingToOpen = !windowOpen && !closed && opensInMs > 0;

  const headLabel = windowOpen
    ? "CLAIM · CLOSES IN"
    : closed
      ? "CLAIM CLOSED"
      : countingToOpen
        ? "CLAIM OPENS IN"
        : "CLAIM OPENS SOON";
  const headTime = windowOpen
    ? fmtHMS(remainingMs)
    : closed
      ? "00:00:00"
      : countingToOpen
        ? fmtCountdown(opensInMs)
        : "SOON";
  const headPhase = windowOpen ? "open" : closed ? "closed" : "upcoming";
  const urgent = windowOpen && remainingMs < 60_000;

  // ---- user flow ----------------------------------------------------------
  const slotsFull = deposited !== undefined && entrants !== undefined && deposited > 0n && entrants >= deposited;
  const onWrongChain = isConnected && chainId !== ROBINHOOD_CHAIN.chainId;
  const justEntered = claimReceipt.isSuccess;
  const claiming = claimWrite.isPending || claimReceipt.isLoading;

  type View =
    | "complete" | "waiting" | "entering" | "upcoming" | "closed"
    | "connect" | "switch" | "checking" | "ineligible" | "full" | "ready";

  let view: View;
  if (distributedToMe) view = "complete";
  else if (hasEntered || justEntered) view = "waiting";
  else if (claiming) view = "entering";
  else if (notOpenedYet) view = "upcoming";
  else if (closed) view = "closed";
  else if (!isConnected) view = "connect";
  else if (onWrongChain) view = "switch";
  else if (!allowlistLoaded) view = "checking";
  else if (!eligible) view = "ineligible";
  else if (slotsFull) view = "full";
  else view = "ready";

  const errMsg =
    (claimWrite.error as { shortMessage?: string } | null)?.shortMessage ??
    (claimReceipt.error as { shortMessage?: string } | null)?.shortMessage;

  const bigBtn = (label: string, onClick: (() => void) | undefined, ghost = false) => (
    <button className={`btn ${ghost ? "btn--ghost" : "btn--lime"} btn--wide`} onClick={onClick} disabled={!onClick}>
      {label}
    </button>
  );

  // Body (middle of the card) + action, by state.
  let body: ReactNode = null;
  let action: ReactNode = null;
  let note = "Free · 1 per wallet";

  const entriesBox = (
    <div style={{ display: "grid", gap: 14, justifyItems: "center" }}>
      <span className="claimbar__k">Entries per user</span>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button className="btn btn--ghost" disabled style={{ width: 54, height: 54, padding: 0, fontSize: 20 }}>
          −
        </button>
        <div
          style={{
            minWidth: 96,
            height: 54,
            display: "grid",
            placeItems: "center",
            border: "2px solid var(--line)",
            background: "var(--bg)",
            fontFamily: "var(--display)",
            fontSize: 18,
          }}
        >
          1
        </div>
        <button className="btn btn--ghost" disabled style={{ width: 54, height: 54, padding: 0, fontSize: 20 }}>
          +
        </button>
      </div>
    </div>
  );

  const pulseBar = (
    <div style={{ display: "grid", gap: 12, width: "100%" }}>
      <span className="claimbar__k" style={{ textAlign: "center" }}>
        The grid is activating
      </span>
      <div className="bar bar--pulse" aria-hidden="true">
        <i />
      </div>
    </div>
  );

  switch (view) {
    case "upcoming":
      body = entriesBox;
      action = bigBtn("Claim opens soon", undefined);
      break;
    case "closed":
      body = entriesBox;
      action = bigBtn("Claim closed", undefined);
      break;
    case "connect":
      body = entriesBox;
      action = bigBtn("Connect Wallet", openConnectModal);
      break;
    case "switch":
      body = entriesBox;
      action = bigBtn("Switch Network", openChainModal);
      break;
    case "checking":
      body = entriesBox;
      action = bigBtn("Checking eligibility…", undefined);
      break;
    case "ineligible":
      body = (
        <p className="claim__sub" style={{ margin: 0 }}>
          This wallet isn't on the approved list.
        </p>
      );
      action = bigBtn("Use another wallet", openAccountModal, true);
      break;
    case "full":
      body = (
        <p className="claim__sub" style={{ margin: 0 }}>
          Every Ruxxell has been claimed.
        </p>
      );
      break;
    case "ready":
      body = entriesBox;
      action = bigBtn("Claim", claim);
      break;
    case "entering":
      body = pulseBar;
      action = bigBtn("Confirm in wallet…", undefined);
      break;
    case "waiting":
      body = (
        <div style={{ display: "grid", gap: 16, width: "100%" }}>
          <p className="claim__sub" style={{ margin: 0, textAlign: "center" }}>
            You're in. Your Ruxxell is sent when the grid activates — you can close this page and come back.
          </p>
          {pulseBar}
        </div>
      );
      note = "Claimed · 1 per wallet";
      break;
    case "complete":
      body = (
        <p className="claim__sub" style={{ margin: 0, textAlign: "center" }}>
          Your Ruxxell is now in your wallet.
        </p>
      );
      action = (
        <a className="btn btn--lime btn--wide" href={shareUrl()} target="_blank" rel="noopener noreferrer">
          Share on X
        </a>
      );
      note = "Claim complete";
      break;
  }

  const titleMap: Record<View, string> = {
    complete: "CLAIM COMPLETE",
    waiting: "CLAIMED",
    entering: "ENTERING THE GRID…",
    upcoming: "FREE CLAIM",
    closed: "CLAIM CLOSED",
    connect: "FREE CLAIM",
    switch: "WRONG NETWORK",
    checking: "FREE CLAIM",
    ineligible: "NOT ON THE GRID",
    full: "FULLY CLAIMED",
    ready: "YOU'RE APPROVED",
  };

  return (
    <section className="inset section">
      <div className="claim">
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span className="tag">Ruxxells</span>
          <h1 className="claim__title px" style={{ marginTop: 12 }}>
            {titleMap[view]}
          </h1>
        </div>

        <div className="claim__panel" style={{ justifyItems: "stretch", gap: 24 }}>
          {/* countdown header */}
          <div className="claimbar" data-phase={headPhase} data-urgent={urgent} role="timer" aria-live="off">
            <span className="claimbar__k">{headLabel}</span>
            <time className="claimbar__t">{headTime}</time>
          </div>

          {/* scheduled open time, in the viewer's own local timezone */}
          {!windowOpen && !closed && (
            <p className="note" style={{ margin: "-8px 0 0", textAlign: "center" }}>
              Opens {LOCAL_OPEN_TIME} — your local time
            </p>
          )}

          {/* body */}
          <div style={{ display: "grid", justifyItems: "center", gap: 18 }}>{body}</div>

          {/* action */}
          {action && <div style={{ display: "grid" }}>{action}</div>}

          {errMsg && (view === "ready" || view === "entering") && (
            <div className="banner" style={{ textAlign: "left" }}>
              {errMsg}
            </div>
          )}

          <p className="note" style={{ margin: 0, textAlign: "center" }}>
            {note}
          </p>
        </div>
      </div>
    </section>
  );
}
