import { BRAND, COLLECTION, DISCLAIMER, ROADMAP } from "@/data/site";
import { Head, Rise, XIcon } from "@/components/ui/Kit";
import AccessForm from "@/components/mint/AccessForm";

const PERKS = [
  { k: "Worldvault", d: "Your Ruxxell gets its own account. Everything it discovers stays attached to it, even on resale." },
  { k: "Mining", d: "24-hour sessions from day one, at a rate your own metadata determines." },
  { k: "Excavation", d: "Spend RUXX to go deeper and pull Fragments and Artifacts out of your world." },
  { k: "Evolution", d: "Rebuild toward 100% integrity and push the NFT through five visible stages." },
  { k: "Leaderboards", d: "Five boards to climb, from raw RUXX mined to deepest excavation." },
  { k: "Raffles", d: "Activity across the ecosystem converts into entries every cycle." },
];

export default function Mint() {
  return (
    <>
      <section className="band" style={{ paddingBottom: "clamp(30px, 4vw, 50px)" }}>
        <div className="wrap wrap--wide">
          <div style={{ display: "grid", gap: "clamp(32px, 5vw, 56px)", gridTemplateColumns: "1fr" }}>
            <Rise>
              <Head
                eyebrow={COLLECTION.status}
                title="Get on the access list"
                body={`${COLLECTION.supplyLabel} Ruxxells on ${COLLECTION.chain}. Mint price ${COLLECTION.mintPrice}. Four steps, one wallet, reviewed by hand.`}
              />
              <AccessForm />
            </Rise>

            <Rise delay={120}>
              <div className="tiles" style={{ gridTemplateColumns: "1fr" }}>
                {PERKS.map((p) => (
                  <article className="tile" data-tone="green" key={p.k}>
                    <span className="mono">{p.k}</span>
                    <p>{p.d}</p>
                  </article>
                ))}
              </div>
            </Rise>
          </div>
        </div>
      </section>

      <section className="band band--tint band--rule">
        <div className="wrap">
          <Rise>
            <Head eyebrow="What happens when" title="The plan" />
          </Rise>
          <Rise delay={80}>
            <div className="timeline">
              {ROADMAP.map((p) => (
                <div className="phase" key={p.t}>
                  <span className="mono" style={{ color: "var(--green)" }}>{p.k}</span>
                  <b>{p.t}</b>
                  <p>{p.d}</p>
                </div>
              ))}
            </div>
          </Rise>
        </div>
      </section>

      <section className="band">
        <div className="wrap wrap--text">
          <Rise>
            <div style={{ textAlign: "center", display: "grid", gap: 20, justifyItems: "center" }}>
              <a className="btn btn--xl btn--ghost" href={BRAND.x} target="_blank" rel="noopener noreferrer">
                <XIcon /> Mint details drop on {BRAND.handle}
              </a>
              <p className="disclaimer" style={{ margin: 0 }}>{DISCLAIMER}</p>
            </div>
          </Rise>
        </div>
      </section>
    </>
  );
}
