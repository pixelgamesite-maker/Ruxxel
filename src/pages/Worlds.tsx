import { Link } from "wouter";
import { PIXELS, COLLECTION } from "@/data/site";
import { MULTIPLIER_CHAIN, RARITIES, STAGES, WORLD_TYPES } from "@/data/utility";
import { Head, Pixel, Rise } from "@/components/ui/Kit";

export default function Worlds() {
  return (
    <>
      <section className="band" style={{ paddingBottom: "clamp(30px, 4vw, 50px)" }}>
        <div className="wrap wrap--wide">
          <Rise>
            <Head
              eyebrow="Worlds"
              title="1,970 environments, each with a specialty"
              body="The art already gives us the environments. Those environments carry small bonuses, so the picture you own actually says something about how it plays."
            />
          </Rise>

          <div className="tiles">
            {WORLD_TYPES.map((w, i) => (
              <Rise key={w.k} delay={i * 70}>
                <article className="tile" data-tone={w.tone}>
                  <span className="mono">{w.k}</span>
                  <p>{w.d}</p>
                  <span className="tile__stat">{w.stat}</span>
                </article>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      <section className="band band--tint band--rule">
        <div className="wrap wrap--wide">
          <Rise>
            <Head
              eyebrow="Evolution"
              title="Five stages, visible on the NFT"
              body="We are not drawing five separate artworks for 1,970 NFTs. Evolution runs through metadata, frames, glows and UI states — so a developed Ruxxell is recognisable at a glance."
            />
          </Rise>

          <div className="tiles">
            {STAGES.map((s, i) => (
              <Rise key={s.k} delay={i * 70}>
                <article className="tile" data-tone={i > 2 ? "pink" : i > 0 ? "cyan" : "green"}>
                  <span className="mono">{s.at}% integrity</span>
                  <h3>{s.k}</h3>
                  <p>{s.d}</p>
                </article>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap wrap--wide">
          <Rise>
            <Head
              eyebrow="Performance"
              title="How every number resolves"
              body="Eight factors, one calculation, one cap. Rank gives an edge. Rarity gives the bigger advantage. Traits give specialization. Progression gives the advantage you earned yourself."
            />
          </Rise>

          <Rise delay={80}>
            <div
              style={{
                padding: "26px",
                borderRadius: "var(--r-lg)",
                border: "1px solid var(--edge)",
                background: "var(--glass)",
                boxShadow: "inset 0 1px 0 var(--hi)",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                {MULTIPLIER_CHAIN.map((m, i) => (
                  <span key={m} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <span className="chip">{m}</span>
                    {i < MULTIPLIER_CHAIN.length - 1 && <span style={{ color: "var(--faint)" }}>×</span>}
                  </span>
                ))}
              </div>
              <p className="note" style={{ marginTop: 18 }}>
                Capped overall, so no single Ruxxell can run away with the economy.
              </p>
            </div>
          </Rise>

          <Rise delay={140}>
            <div className="table-wrap" style={{ marginTop: 22 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Class</th>
                    <th scope="col">Share of supply</th>
                    <th scope="col">Yield multiplier</th>
                  </tr>
                </thead>
                <tbody>
                  {RARITIES.map((r) => (
                    <tr key={r.k}>
                      <td style={{ color: r.tone, fontWeight: 600 }}>{r.k}</td>
                      <td>{r.share}</td>
                      <td>{r.mult}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Rise>
        </div>
      </section>

      <section className="band band--tint band--rule">
        <div className="wrap wrap--wide">
          <Rise>
            <Head eyebrow="Unrevealed" title="The collection" body={`${COLLECTION.supplyLabel} worlds, straight from the lab. No filters, no upscaling.`} />
          </Rise>
          <Rise delay={80}>
            <div className="gallery">
              {PIXELS.map((src, i) => (
                <Pixel key={src} src={src} alt={`Ruxxell ${i + 1}`} label={`#${i + 1}`} />
              ))}
            </div>
          </Rise>
          <Rise delay={160}>
            <div style={{ marginTop: 30 }}>
              <Link href="/mint" className="btn">
                Join the access list
              </Link>
            </div>
          </Rise>
        </div>
      </section>
    </>
  );
}
