import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useConnectModal, useChainModal, useAccountModal } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { RAFFLE_ADDRESS, RAFFLE_ABI, RAFFLE_IS_SET, shareUrl } from "@/lib/raffleContract";
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

export default function Claim() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();
  const { openAccountModal } = useAccountModal();

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
    contracts: [{ ...contract, functionName: "hasEntered", args: [address ?? ZERO_ADDR] }],
    query: { enabled: RAFFLE_IS_SET && isConnected },
  });
  const hasEntered = enteredData?.[0]?.result as boolean | undefined;

  // Static allowlist file dropped into public/ by the admin page.
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

  // ---- phase + view --------------------------------------------------------
  const notOpenedYet = !RAFFLE_IS_SET || entryDeadline === undefined || entryDeadline === 0n;
  const windowOpen = isOpen === true;
  const closed = entryDeadline !== undefined && entryDeadline !== 0n && !windowOpen;
  const slotsFull = deposited !== undefined && entrants !== undefined && deposited > 0n && entrants >= deposited;
  const onWrongChain = isConnected && chainId !== ROBINHOOD_CHAIN.chainId;

  type View =
    | "upcoming" | "closed" | "connect" | "switch" | "checking" | "ineligible" | "full" | "ready" | "entering" | "finalizing" | "complete";

  let view: View;
  if (hasEntered || claimReceipt.isSuccess) view = "complete";
  else if (claimReceipt.isLoading) view = "finalizing";
  else if (claimWrite.isPending) view = "entering";
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

  // ---- per-view content ----------------------------------------------------
  let headline = "FREE CLAIM";
  let sub: string | null = null;
  let barLabel: string | null = null;
  let showBar = false;
  let action: ReactNode = null;

  const bigBtn = (label: string, onClick: (() => void) | undefined) => (
    <button className="btn btn--lime btn--wide" onClick={onClick} disabled={!onClick}>
      {label}
    </button>
  );

  switch (view) {
    case "upcoming":
      headline = "FREE CLAIM";
      sub = "Claiming opens soon.";
      barLabel = "THE GRID IS ACTIVATING";
      showBar = true;
      break;
    case "closed":
      headline = "CLAIM CLOSED";
      sub = "This claim has ended.";
      break;
    case "connect":
      headline = "FREE CLAIM";
      sub = "Connect your approved wallet to check eligibility.";
      action = bigBtn("Connect Wallet", openConnectModal);
      barLabel = "THE GRID IS ACTIVATING";
      showBar = true;
      break;
    case "switch":
      headline = "WRONG NETWORK";
      sub = `Switch to ${ROBINHOOD_CHAIN.name} to continue.`;
      action = bigBtn("Switch Network", openChainModal);
      break;
    case "checking":
      headline = "CHECKING…";
      sub = "Verifying your wallet.";
      showBar = true;
      break;
    case "ineligible":
      headline = "NOT ON THE GRID";
      sub = "This wallet isn't on the approved list.";
      action = (
        <button className="btn btn--ghost btn--wide" onClick={openAccountModal}>
          Use another wallet
        </button>
      );
      break;
    case "full":
      headline = "FULLY CLAIMED";
      sub = "Every Ruxxell has been claimed.";
      break;
    case "ready":
      headline = "YOU'RE APPROVED";
      sub = "Claim your free Ruxxell.";
      action = bigBtn("Claim", claim);
      break;
    case "entering":
      headline = "ENTERING THE GRID…";
      sub = "Confirm in your wallet.";
      showBar = true;
      break;
    case "finalizing":
      headline = "FINALIZING…";
      sub = "Writing your claim on-chain.";
      showBar = true;
      break;
    case "complete":
      headline = "CLAIM COMPLETE";
      sub = "Your Ruxxell is now in your wallet.";
      action = (
        <a className="btn btn--lime btn--wide" href={shareUrl()} target="_blank" rel="noopener noreferrer">
          Share on X
        </a>
      );
      break;
  }

  return (
    <section className="inset section">
      <div className="claim" style={{ textAlign: "center" }}>
        <span className="tag">Ruxxells</span>
        <h1 className="claim__title px" style={{ marginTop: 14 }}>
          {headline}
        </h1>
        {sub && (
          <p className="claim__sub" style={{ marginTop: 18, marginInline: "auto", maxWidth: "26em" }}>
            {sub}
          </p>
        )}

        {action && <div style={{ marginTop: 30, display: "grid", justifyItems: "center" }}>{action}</div>}

        {showBar && (
          <div style={{ marginTop: 32 }}>
            {barLabel && (
              <p className="claimbar__k" style={{ marginBottom: 12, textAlign: "center" }}>
                {barLabel}
              </p>
            )}
            <div className="bar bar--pulse" aria-hidden="true">
              <i />
            </div>
          </div>
        )}

        {errMsg && (view === "ready" || view === "entering" || view === "finalizing") && (
          <div className="banner" style={{ marginTop: 24, textAlign: "left" }}>
            {errMsg}
          </div>
        )}
      </div>
    </section>
  );
}
