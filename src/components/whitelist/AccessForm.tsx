import { BRAND, COLLECTION } from "@/data/site";
import { isEvmAddress, isHttpUrl } from "@/lib/format";
import { XIcon } from "@/components/ui/Kit";
import Mission from "./Mission";
import { useAccessForm } from "./useAccessForm";

export default function AccessForm() {
  const f = useAccessForm();

  if (f.submitted) {
    return (
      <div className="block" style={{ margin: "0 16px" }}>
        <h1 style={{ fontSize: "2rem" }}>You are in the queue.</h1>
        <p style={{ marginTop: 12 }}>
          Applications get read by a human. Selected wallets are announced on {BRAND.handle} before
          mint, along with the price and date.
        </p>
        <div className="block__cta">
          <a className="btn-dark" href={BRAND.x} target="_blank" rel="noopener noreferrer">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <XIcon /> Follow for the drop
            </span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="progress">
        <i style={{ width: `${(f.done / 4) * 100}%` }} />
      </div>
      <p className="note" style={{ padding: "0 16px 14px" }}>
        {f.done} of 4 done · {COLLECTION.supplyLabel} passes · one per wallet
      </p>

      <Mission
        n={1}
        title={`Follow ${BRAND.handle}`}
        hint="Then drop your handle so we can match you"
        done={f.step1}
        locked={false}
      >
        <a className="btn btn--ghost btn--sm" href={BRAND.x} target="_blank" rel="noopener noreferrer">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <XIcon /> Open profile
          </span>
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
      </Mission>

      <Mission
        n={2}
        title="Like and repost the pinned post"
        hint="Tag two people who would use this"
        done={f.step2}
        locked={!f.step1}
      >
        <a className="btn btn--ghost btn--sm" href={BRAND.x} target="_blank" rel="noopener noreferrer">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <XIcon /> Open the post
          </span>
        </a>
        <button className="btn btn--sm" onClick={() => f.setEngagedOk(true)}>
          Done it
        </button>
      </Mission>

      <Mission n={3} title="Quote the pinned post" hint="Paste your quote link" done={f.step3} locked={!f.step2}>
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
      </Mission>

      <Mission
        n={4}
        title="Add your wallet"
        hint={`The address holding your pass on ${COLLECTION.chain}`}
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
      </Mission>

      {f.error && (
        <p className="banner banner--err" role="alert">
          {f.error}
        </p>
      )}

      <button className="btn btn--wide" onClick={f.submit} disabled={!f.complete || f.sending}>
        {f.sending ? "Sending..." : "Submit application"}
      </button>

      <p className="note" style={{ padding: "12px 16px 0" }}>
        Applications are picked by hand, so finishing all four steps is not a guaranteed spot.
      </p>
    </>
  );
}
