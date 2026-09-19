import { BRAND, COLLECTION, DISCLAIMER, ROADMAP } from "@/data/site";
import { Section, XIcon } from "@/components/ui/Kit";
import AccessForm from "@/components/whitelist/AccessForm";

const PERKS = [
  "Unlimited alerts on every covered asset",
  "The war room: overlap, concentration, risk",
  "Full history instead of the last 90 days",
  "First look at assets as they get tokenized",
  "A vote on what gets covered next",
];

export default function Mint() {
  return (
    <>
      <div className="block">
        <h1>
          Get on the
          <br />
          access list.
        </h1>
        <span className="mono">{COLLECTION.status}</span>
        <p>
          {COLLECTION.supplyLabel} passes on {COLLECTION.chain}. Mint price {COLLECTION.mintPrice}.
          Four steps, one wallet, reviewed by hand.
        </p>
      </div>

      <div className="stats" style={{ marginTop: 14 }}>
        <div className="stat">
          <b>{COLLECTION.supplyLabel}</b>
          <span>Supply</span>
        </div>
        <div className="stat">
          <b>{COLLECTION.mintPrice}</b>
          <span>Price</span>
        </div>
        <div className="stat">
          <b>1</b>
          <span>Per wallet</span>
        </div>
      </div>

      <Section title="Apply" meta="4 steps">
        <AccessForm />
      </Section>

      <Section title="What a pass opens" meta="Holders only">
        {PERKS.map((p) => (
          <div className="strip-row" key={p}>
            <span className="dot" />
            <span style={{ fontSize: "0.9rem" }}>{p}</span>
          </div>
        ))}
      </Section>

      <Section title="The plan" meta="Roadmap">
        <div className="timeline">
          {ROADMAP.map((p) => (
            <div className="phase" key={p.t}>
              <span className="mono" style={{ color: "var(--rh)" }}>
                {p.k}
              </span>
              <b>{p.t}</b>
              <p>{p.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <div style={{ padding: "22px 16px 0" }}>
        <a
          className="btn btn--ghost"
          href={BRAND.x}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <XIcon /> Mint details drop on {BRAND.handle}
        </a>
      </div>

      <p className="disclaimer">{DISCLAIMER}</p>
    </>
  );
}
