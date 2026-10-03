import { BRAND, EXPLORER_TX } from "@/data/site";
import { ArrowRight, ArrowUpRight } from "@/components/ui/Icons";
import { claimMode } from "@/lib/claim";
import { useClaim } from "@/lib/claim/useClaim";
import { useWallet } from "@/lib/claim/useWallet";
import { fmtHMS, fmtMS, shortAddr } from "@/lib/format";

const STEPS = ["Connect", "Check", "Claim", "Processing", "Complete"] as const;

export default function ClaimPanel() {
  const w = useWallet();
  const c = useClaim(w.address, w.signMessage);

  /* ---- global countdown strip ------------------------------------------ */
  const remaining = c.win ? c.win.closesAt - c.now : 0;
  const untilOpen = c.win ? c.win.opensAt - c.now : 0;

  const strip =
    c.phase === "upcoming"
      ? { k: "FREE claim opens in:", t: fmtHMS(untilOpen) }
      : c.phase === "open"
        ? { k: "FREE claim closes in:", t: fmtHMS(remaining) }
        : c.phase === "closed"
          ? { k: "FREE claim closed", t: "00:00:00" }
          : { k: "FREE claim closes in:", t: "--:--:--" };

  /* ---- which step of the flow are we on --------------------------------- */
  const s = c.status;
  let at = 0;
  if (w.address) at = 1;
  if (s?.state === "eligible") at = 2;
  if (s?.state === "processing" || s?.state === "finalizing") at = 3;
  if (s?.state === "complete") at = 4;

  return (
    <div className="claim">
      <div
        className="claimbar"
        data-phase={c.phase}
        data-urgent={c.phase === "open" && remaining < 60_000}
        role="timer"
        aria-live="off"
      >
        <span className="claimbar__k">{strip.k}</span>
        <time className="claimbar__t">{strip.t}</time>
      </div>

      <ol className="flow" aria-label="Claim steps">
        {STEPS.map((label, i) => (
          <li key={label} className={`${i <= at ? "on" : ""} ${i === at ? "now" : ""}`}>
            {label}
          </li>
        ))}
      </ol>

      <div className="claim__panel" data-tone={s?.state === "complete" || s?.state === "eligible" ? "ok" : undefined}>
        {w.address && (
          <div className="claim__wallet">
            <span className="claim__addr">{shortAddr(w.address)}</span>
            <button className="claim__link" onClick={w.disconnect}>
              Disconnect
            </button>
          </div>
        )}

        {renderBody()}
      </div>

      {claimMode === "mock" && (
        <p className="note" style={{ marginTop: 18, textAlign: "center" }}>
          Demo mode: no backend is connected. Any wallet works; addresses ending in 0 have no claim.
        </p>
      )}
    </div>
  );

  /* ---- the panel body ---------------------------------------------------- */
  function renderBody() {
    // 1. not connected
    if (!w.address) {
      return (
        <>
          <h2 className="display h-lg claim__title">Free claim</h2>
          <p className="claim__sub">
            Connect the wallet you were approved with. We check it against the FREE claim list and
            show you what is reserved.
          </p>
          {c.phase === "closed" && (
            <p className="note">FREE claiming has closed. You can still connect to see a claim you already made.</p>
          )}
          <button className="btn btn--lime" onClick={w.connect} disabled={w.connecting}>
            {w.connecting ? "Connecting…" : <>Connect wallet <ArrowRight /></>}
          </button>
          {w.error && <p className="banner">{w.error}</p>}
        </>
      );
    }

    // 2. checking
    if (!s) {
      return (
        <>
          <h2 className="display h-lg claim__title blink">Checking wallet…</h2>
          {c.error ? (
            <>
              <p className="banner">{c.error}</p>
              <button className="btn btn--ghost btn--sm" onClick={() => c.refresh()}>
                Try again
              </button>
            </>
          ) : (
            <p className="claim__sub">Looking for a FREE claim on this wallet.</p>
          )}
        </>
      );
    }

    // 3. not on the list
    if (s.state === "none") {
      return (
        <>
          <h2 className="display h-lg claim__title">No FREE claim</h2>
          <p className="claim__sub">There is no FREE claim associated with this wallet.</p>
          <p className="note">Wrong wallet? Disconnect and connect the one you applied with.</p>
        </>
      );
    }

    // 4. approved, nothing submitted yet
    if (s.state === "eligible") {
      if (c.phase === "closed") {
        return (
          <>
            <h2 className="display h-lg claim__title">Claim closed</h2>
            <p className="claim__sub">
              This wallet was approved, but no claim was made before the window closed. FREE claiming
              is over.
            </p>
          </>
        );
      }
      const open = c.phase === "open";
      return (
        <>
          <span className="tag">Free claim approved</span>
          <h2 className="display h-lg claim__title">1 Ruxxell reserved</h2>
          <p className="claim__sub">
            {open
              ? "Press claim and sign the message in your wallet. Signing costs no gas."
              : "Claiming opens when the countdown above reaches zero."}
          </p>
          {c.error && <p className="banner" role="alert">{c.error}</p>}
          <button className="btn btn--lime" onClick={c.claim} disabled={!open || c.busy !== ""}>
            {c.busy === "signing" ? (
              <span className="blink">Check your wallet…</span>
            ) : c.busy === "sending" ? (
              <span className="blink">Sending…</span>
            ) : (
              <>Claim <ArrowRight /></>
            )}
          </button>
        </>
      );
    }

    // 5. accepted, 3:00 per-user timer. Never says "complete" on its own.
    if (s.state === "processing" || s.state === "finalizing") {
      const left = s.state === "processing" ? s.deliverAt - c.now : 0;
      const waiting = s.state === "finalizing" || left <= 0;
      const total = s.state === "processing" ? s.deliverAt - s.acceptedAt : 1;
      const pct = waiting ? 100 : Math.min(100, Math.max(0, ((total - left) / total) * 100));
      return (
        <>
          <span className="tag">{waiting ? "Finalizing" : "Claim accepted"}</span>
          <h2 className="display h-lg claim__title">{waiting ? "Finalizing…" : "Claim processing"}</h2>
          <p className="claim__sub">
            {waiting
              ? "Your Ruxxell has been sent. Waiting for the network to confirm it."
              : "Your Ruxxell is on its way."}
          </p>
          <div className="claim__big" data-wait={waiting} aria-live="polite">
            {waiting ? <span className="blink">…</span> : fmtMS(left)}
          </div>
          <div className="bar" aria-hidden="true">
            <i style={{ width: `${pct}%` }} />
          </div>
          <p className="note">
            You can close this page. Your claim is saved and finishes on its own, even after the claim
            window ends.
          </p>
        </>
      );
    }

    // 6. confirmed onchain
    return (
      <>
        <span className="tag">Confirmed onchain</span>
        <h2 className="display h-lg claim__title">Claim complete</h2>
        <p className="claim__sub">Your Ruxxell has entered your wallet.</p>
        <div className="claim__row">
          <a className="btn btn--lime btn--sm" href={BRAND.launchpad} target="_blank" rel="noopener noreferrer">
            View on OpenSea <ArrowUpRight />
          </a>
          <a className="btn btn--ghost btn--sm" href={`${EXPLORER_TX}${s.txHash}`} target="_blank" rel="noopener noreferrer">
            View transaction <ArrowUpRight />
          </a>
        </div>
      </>
    );
  }
}
