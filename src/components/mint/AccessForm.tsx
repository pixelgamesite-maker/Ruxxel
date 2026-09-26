import { BRAND, COLLECTION } from "@/data/site";
import { isEvmAddress, isHttpUrl } from "@/lib/format";
import { XIcon } from "@/components/ui/Kit";
import Step from "./Step";
import { useAccessForm } from "./useAccessForm";

export default function AccessForm() {
  const f = useAccessForm();

  if (f.submitted) {
    return (
      <div
        style={{
          padding: "30px",
          borderRadius: "var(--r-lg)",
          border: "1px solid rgba(43, 255, 134, 0.5)",
          background: "linear-gradient(168deg, rgba(43,255,134,0.12), rgba(255,255,255,0.03))",
          display: "grid",
          gap: 16,
          justifyItems: "start",
        }}
      >
        <span className="mono" style={{ color: "var(--green)" }}>Application received</span>
        <h3 style={{ fontSize: "1.5rem" }}>You are in the review queue.</h3>
        <p style={{ margin: 0, color: "var(--mute)" }}>
          Applications are read by a human. Selected wallets are announced on {BRAND.handle} before
          mint, along with the price and date.
        </p>
        <a className="btn btn--sm" href={BRAND.x} target="_blank" rel="noopener noreferrer">
          <XIcon /> Follow for the drop
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="progress">
        <i style={{ width: `${(f.done / 4) * 100}%` }} />
      </div>
      <p className="note" style={{ marginBottom: 16 }}>
        {f.done} of 4 done · {COLLECTION.supplyLabel} passes · one per wallet
      </p>

      <Step n={1} title={`Follow ${BRAND.handle}`} hint="Then drop your handle so we can match you" done={f.step1} locked={false}>
        <a className="btn btn--sm btn--ghost" href={BRAND.x} target="_blank" rel="noopener noreferrer">
          <XIcon /> Open profile
        </a>
        <div className="inline">
          <input
            className="input"
            placeholder="@yourhandle"
            value={f.twitter}
            onChange={(e) => f.setTwitter(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && f.twitter.trim().length > 1 && f.setTwitterOk(true)}
            aria-label="Your X handle"
          />
          <button className="btn btn--sm" disabled={f.twitter.trim().length < 2} onClick={() => f.setTwitterOk(true)}>
            Save
          </button>
        </div>
      </Step>

      <Step n={2} title="Like and repost the pinned post" hint="Tag two people who would play this" done={f.step2} locked={!f.step1}>
        <a className="btn btn--sm btn--ghost" href={BRAND.x} target="_blank" rel="noopener noreferrer">
          <XIcon /> Open the post
        </a>
        <button className="btn btn--sm" onClick={() => f.setEngagedOk(true)}>Done it</button>
      </Step>

      <Step n={3} title="Quote the pinned post" hint="Paste your quote link" done={f.step3} locked={!f.step2}>
        <div className="inline">
          <input
            className="input"
            placeholder="https://x.com/you/status/..."
            value={f.quoteUrl}
            onChange={(e) => f.setQuoteUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && isHttpUrl(f.quoteUrl) && f.setQuoteOk(true)}
            aria-label="Link to your quote post"
          />
          <button className="btn btn--sm" disabled={!isHttpUrl(f.quoteUrl)} onClick={() => f.setQuoteOk(true)}>
            Save
          </button>
        </div>
        {f.quoteUrl.length > 4 && !isHttpUrl(f.quoteUrl) && (
          <p className="note">That is not a full link. It should start with https://x.com/</p>
        )}
      </Step>

      <Step
        n={4}
        title="Add your wallet"
        hint={`The address holding your Ruxxell on ${COLLECTION.chain}`}
        done={f.step4}
        locked={!f.step3}
      >
        <div className="inline">
          <input
            className="input"
            placeholder="0x..."
            value={f.wallet}
            onChange={(e) => f.setWallet(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && isEvmAddress(f.wallet) && f.setWalletOk(true)}
            aria-label="Your wallet address"
            spellCheck={false}
          />
          <button className="btn btn--sm" disabled={!isEvmAddress(f.wallet)} onClick={() => f.setWalletOk(true)}>
            Save
          </button>
        </div>
        {f.wallet.length > 4 && !isEvmAddress(f.wallet) && (
          <p className="note">A wallet address is 42 characters and starts with 0x.</p>
        )}
      </Step>

      {f.error && (
        <p className="banner banner--err" role="alert">{f.error}</p>
      )}

      <button className="btn btn--wide" onClick={f.submit} disabled={!f.complete || f.sending}>
        {f.sending ? "Sending…" : "Submit application"}
      </button>

      <p className="note" style={{ marginTop: 14 }}>
        Applications are picked by hand, so finishing all four steps is not a guaranteed spot.
      </p>
    </>
  );
}
