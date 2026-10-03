import { BRAND, COLLECTION, DISCLAIMER } from "@/data/site";
import AccessForm from "@/components/checkpoint/AccessForm";

export default function Checkpoint() {
  return (
    <section className="inset">
      <div className="page-head">
        <span className="tag">Checkpoint</span>
        <h1 className="display h-lg">Get cleared</h1>
        <p className="lede">
          Four steps, then your wallet. Price {COLLECTION.mintPrice}, supply {COLLECTION.supplyLabel}.
          Applications are read by hand.
        </p>
      </div>

      <div className="cp">
        <div>
          <AccessForm />
        </div>

        <aside className="side" aria-label="About the list">
          <span className="tag">Before you start</span>
          <dl className="side__facts">
            <div>
              <dt>Chain</dt>
              <dd>{BRAND.chain}</dd>
            </div>
            <div>
              <dt>One per wallet</dt>
              <dd>The address you add is the one that gets cleared. Use the one you will mint from.</dd>
            </div>
            <div>
              <dt>Announced on X</dt>
              <dd>
                Selected wallets, price and date are posted on {BRAND.handle} before the mint.
              </dd>
            </div>
          </dl>
          <p className="note" style={{ marginTop: 24 }}>{DISCLAIMER}</p>
        </aside>
      </div>
    </section>
  );
}
