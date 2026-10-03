import { BRAND, COLLECTION } from "@/data/site";
import { isEvmAddress, isHttpUrl } from "@/lib/format";
import { ArrowRight, XIcon } from "@/components/ui/Icons";
import Step from "./Step";
import { useAccessForm } from "./useAccessForm";

export default function AccessForm() {
  const f = useAccessForm();

  if (f.submitted) {
    return (
      <div className="done-card">
        <span className="tag">Application received</span>
        <h2 className="display h-lg">You are in the review queue</h2>
        <p className="lede">
          Applications are read by a human. Selected wallets are announced on {BRAND.handle} before
          mint, along with the price and date.
        </p>
        <a className="btn btn--lime btn--sm" href={BRAND.x} target="_blank" rel="noopener noreferrer">
          <XIcon /> Follow for the drop
        </a>
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="meter" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} className={i < f.done ? "on" : ""} />
          ))}
        </div>
        <p className="meter__txt">
          {f.done} of 4 done · {COLLECTION.supplyLabel} passes · one per wallet
        </p>
      </div>

      <div className="cp__steps" style={{ marginTop: 22 }}>
        <Step n={1} title={`Follow ${BRAND.handle}`} hint="Then drop your handle so we can match you" done={f.step1} locked={false}>
          <a className="btn btn--ghost btn--sm" href={BRAND.x} target="_blank" rel="noopener noreferrer">
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
              autoComplete="off"
            />
            <button className="btn btn--lime btn--sm" disabled={f.twitter.trim().length < 2} onClick={() => f.setTwitterOk(true)}>
              Save
            </button>
          </div>
        </Step>

        <Step n={2} title="Like and repost the pinned post" hint="Tag two people who would play this" done={f.step2} locked={!f.step1}>
          <a className="btn btn--ghost btn--sm" href={BRAND.x} target="_blank" rel="noopener noreferrer">
            <XIcon /> Open the post
          </a>
          <button className="btn btn--lime btn--sm" onClick={() => f.setEngagedOk(true)}>
            Done it
          </button>
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
              autoComplete="off"
            />
            <button className="btn btn--lime btn--sm" disabled={!isHttpUrl(f.quoteUrl)} onClick={() => f.setQuoteOk(true)}>
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
          hint={`The address that should hold your Ruxxell on ${BRAND.chain}`}
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
              autoComplete="off"
            />
            <button className="btn btn--lime btn--sm" disabled={!isEvmAddress(f.wallet)} onClick={() => f.setWalletOk(true)}>
              Save
            </button>
          </div>
          {f.wallet.length > 4 && !isEvmAddress(f.wallet) && (
            <p className="note">A wallet address is 42 characters and starts with 0x.</p>
          )}
        </Step>

        {f.error && (
          <p className="banner" role="alert">
            {f.error}
          </p>
        )}

        <button className="btn btn--lime btn--wide" onClick={f.submit} disabled={!f.complete || f.sending}>
          {f.sending ? "Sending…" : (
            <>
              Submit application <ArrowRight />
            </>
          )}
        </button>
        <p className="note">
          Applications are picked by hand, so finishing all four steps is not a guaranteed spot.
        </p>
      </div>
    </>
  );
}
