import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { RAFFLE_ADDRESS, RAFFLE_ABI, RAFFLE_IS_SET } from "@/lib/raffleContract";

const ZERO_ADDR = "0x0000000000000000000000000000000000000000" as const;

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

  const contract = { address: RAFFLE_ADDRESS, abi: RAFFLE_ABI } as const;
  const { data, refetch } = useReadContracts({
    contracts: [
      { ...contract, functionName: "entryDeadline" },
      { ...contract, functionName: "isOpen" },
      { ...contract, functionName: "depositedCount" },
      { ...contract, functionName: "entrantsCount" },
      { ...contract, functionName: "swept" },
    ],
    query: { enabled: RAFFLE_IS_SET, refetchInterval: 15000 },
  });

  const entryDeadline = data?.[0]?.result as bigint | undefined;
  const isOpen = data?.[1]?.result as boolean | undefined;
  const deposited = data?.[2]?.result as bigint | undefined;
  const entrants = data?.[3]?.result as bigint | undefined;

  const { data: enteredData, refetch: refetchEntered } = useReadContracts({
    contracts: [{ ...contract, functionName: "hasEntered", args: [address ?? ZERO_ADDR] }],
    query: { enabled: RAFFLE_IS_SET && isConnected },
  });
  const hasEntered = enteredData?.[0]?.result as boolean | undefined;

  const claimWrite = useWriteContract();
  const claimReceipt = useWaitForTransactionReceipt({ hash: claimWrite.data });

  useEffect(() => {
    if (claimReceipt.isSuccess) {
      refetch();
      refetchEntered();
    }
  }, [claimReceipt.isSuccess, refetch, refetchEntered]);

  function claim() {
    claimWrite.reset();
    claimWrite.writeContract({ address: RAFFLE_ADDRESS, abi: RAFFLE_ABI, functionName: "enter" });
  }

  // ---- phase ---------------------------------------------------------------
  const deadlineMs = entryDeadline !== undefined ? Number(entryDeadline) * 1000 : 0;
  const notOpenedYet = !RAFFLE_IS_SET || entryDeadline === undefined || entryDeadline === 0n;
  const windowOpen = isOpen === true;
  const closed = entryDeadline !== undefined && entryDeadline !== 0n && !windowOpen;
  const slotsFull = deposited !== undefined && entrants !== undefined && entrants >= deposited && deposited > 0n;
  const remainingMs = deadlineMs - now;

  const spotsLeft =
    deposited !== undefined && entrants !== undefined
      ? deposited > entrants
        ? deposited - entrants
        : 0n
      : undefined;

  const pct =
    deposited !== undefined && deposited > 0n && entrants !== undefined
      ? Math.min(100, Number((entrants * 100n) / deposited))
      : 0;

  // ---- countdown strip -----------------------------------------------------
  const phase = notOpenedYet ? "upcoming" : windowOpen ? "open" : "closed";
  const strip =
    phase === "open"
      ? { k: "Claim closes in", t: fmtHMS(remainingMs) }
      : phase === "closed"
        ? { k: "Claim closed", t: "00:00:00" }
        : { k: "Claim opens soon", t: "--:--:--" };
  const urgent = phase === "open" && remainingMs < 60_000;

  const errMsg =
    (claimWrite.error as { shortMessage?: string } | null)?.shortMessage ??
    (claimReceipt.error as { shortMessage?: string } | null)?.shortMessage;

  // ---- the one big button, by state ---------------------------------------
  function renderAction() {
    return (
      <ConnectButton.Custom>
        {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
          const ready = mounted;
          const connected = ready && !!account && !!chain;

          let label = "Claim";
          let disabled = false;
          let onClick: (() => void) | undefined;

          if (!ready) {
            label = "Loading…";
            disabled = true;
          } else if (!connected) {
            label = "Connect Wallet";
            onClick = openConnectModal;
          } else if (chain.unsupported) {
            label = "Switch Network";
            onClick = openChainModal;
          } else if (notOpenedYet) {
            label = "Claim opens soon";
            disabled = true;
          } else if (hasEntered) {
            label = "Claimed ✓";
            disabled = true;
          } else if (closed) {
            label = "Claim closed";
            disabled = true;
          } else if (slotsFull) {
            label = "Fully claimed";
            disabled = true;
          } else if (claimWrite.isPending) {
            label = "Confirm in wallet…";
            disabled = true;
          } else if (claimReceipt.isLoading) {
            label = "Claiming…";
            disabled = true;
          } else if (windowOpen) {
            label = "Claim";
            onClick = claim;
          } else {
            label = "Claim unavailable";
            disabled = true;
          }

          return (
            <>
              <button className="btn btn--lime btn--wide" onClick={onClick} disabled={disabled}>
                {label}
              </button>
              {connected && !chain.unsupported && (
                <div className="claim__row" style={{ justifyContent: "center", marginTop: 16 }}>
                  <button className="claim__link" onClick={openAccountModal}>
                    {account.displayName} · Manage
                  </button>
                </div>
              )}
            </>
          );
        }}
      </ConnectButton.Custom>
    );
  }

  return (
    <section className="inset section">
      <div className="claim" style={{ textAlign: "center" }}>
        <span className="tag">Ruxxells</span>
        <h1 className="claim__title px" style={{ marginTop: 16 }}>
          Ruxxell Claim
        </h1>

        <div className="claimbar" data-phase={phase} data-urgent={urgent} role="timer" aria-live="off" style={{ marginTop: 34 }}>
          <span className="claimbar__k">{strip.k}</span>
          <time className="claimbar__t">{strip.t}</time>
        </div>

        <div className="bar" style={{ marginTop: 20 }} aria-hidden="true">
          <i style={{ width: `${pct}%` }} />
        </div>
        <p className="note" style={{ marginTop: 12 }}>
          {deposited !== undefined && entrants !== undefined
            ? `${entrants.toString()} / ${deposited.toString()} claimed`
            : "—"}
        </p>

        <dl className="stats" style={{ marginTop: 28, gridTemplateColumns: "repeat(3, 1fr)" }}>
          <div className="stat">
            <dt>Supply</dt>
            <dd>{deposited !== undefined ? deposited.toString() : "—"}</dd>
          </div>
          <div className="stat">
            <dt>Claimed</dt>
            <dd>{entrants !== undefined ? entrants.toString() : "—"}</dd>
          </div>
          <div className="stat">
            <dt>Spots left</dt>
            <dd>{spotsLeft !== undefined ? spotsLeft.toString() : "—"}</dd>
          </div>
        </dl>

        {hasEntered && (
          <div className="banner banner--ok" style={{ marginTop: 24, textAlign: "left" }}>
            You're in. Your Ruxxell is on the way — keep this wallet connected.
          </div>
        )}
        {errMsg && (
          <div className="banner" style={{ marginTop: 24, textAlign: "left" }}>
            {errMsg}
          </div>
        )}

        <div style={{ marginTop: 32, display: "grid", justifyItems: "center" }}>{renderAction()}</div>

        <p className="note" style={{ marginTop: 20 }}>
          Free · one per wallet
        </p>
      </div>
    </section>
  );
}
