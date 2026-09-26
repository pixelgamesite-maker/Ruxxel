import { Link } from "wouter";
import { BRAND, COLLECTION, MOTION, PIXELS, ROADMAP } from "@/data/site";
import { LOOP, MULTIPLIER_CHAIN, RARITIES, RESALE, WORLD_TYPES } from "@/data/utility";
import { Head, Media, Rise, XIcon } from "@/components/ui/Kit";
import MiningCards from "@/components/home/MiningCards";
import IntegrityDial from "@/components/home/IntegrityDial";

const TICKER = [
  ["Sessions run", "24h"],
  ["Supply", COLLECTION.supplyLabel],
  ["Worlds", "1 per Ruxxell"],
  ["Currency", "RUXX Points"],
  ["Depth cap", "None"],
  ["Integrity", "0 → 100%"],
  ["Stages", "5"],
  ["Chain", COLLECTION.chain],
];

export default function Home() {
  return (
    <>
      {/* ───────────────────────────────── hero */}
      <section className="hero">
        <div className="wrap wrap--wide hero__grid">
          <Rise>
            <span className="chip live">
              <i className="dot" /> {COLLECTION.status}
            </span>

            <h1 style={{ marginTop: 22 }}>
              Every Ruxxell is an <span className="grad">explorable fragment</span> of another world.
            </h1>

            <p className="hero__lead">
              {COLLECTION.supplyLabel} pixel worlds on {COLLECTION.chain}. Minting is where it
              starts, not where it ends. Mine it. Excavate it. Rebuild it. Evolve it.
            </p>

            <div className="hero__cta">
              <Link href="/mint" className="btn btn--xl">
                Join the access list
              </Link>
              <Link href="/mine" className="btn btn--xl btn--ghost">
                Try the rig
              </Link>
            </div>

            <div className="hero__loop">
              {["Mint", "Reveal", "Connect", "Mine", "Excavate", "Rebuild", "Evolve"].map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </Rise>

          <Rise delay={120}>
            <div className="stack">
              <div className="stack__i">
                <Media src={MOTION[0]} alt="A Ruxxell world" />
              </div>
              <div className="stack__i">
                <Media src={PIXELS[1]} alt="A Ruxxell world" />
              </div>
              <div className="stack__i">
                <Media src={PIXELS[2]} alt="A Ruxxell world" />
              </div>
              <span className="stack__tag">
                <i className="dot" /> 1,970 worlds
              </span>
            </div>
          </Rise>
        </div>
      </section>

      {/* ───────────────────────────────── marquee */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {[...TICKER, ...TICKER].map(([k, v], i) => (
            <span className="marquee__i" key={i}>
              <i /> {k} <b>{v}</b>
            </span>
          ))}
        </div>
      </div>

      {/* ───────────────────────────────── the loop */}
      <section className="band">
        <div className="wrap wrap--wide">
          <Rise>
            <Head
              eyebrow="The core loop"
              title="Nothing here is disconnected"
              body="Every part feeds the next one. Mining pays for excavation, excavation finds the parts, the parts rebuild the world, and a rebuilt world mines better than it did before."
            />
          </Rise>

          <div className="loop">
            {LOOP.map((s, i) => (
              <Rise key={s.k} delay={i * 70}>
                <div className="loop__i" data-tone={s.tone}>
                  <span className="loop__n">{String(i + 1).padStart(2, "0")}</span>
                  <div className="loop__b">
                    <span className="mono">{s.k}</span>
                    <h3>{s.t}</h3>
                    <p>{s.d}</p>
                  </div>
                </div>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────────────── live rigs */}
      <section className="band band--tint band--rule">
        <div className="wrap wrap--wide">
          <Rise>
            <Head
              eyebrow="Mining"
              title="Nobody earns just for holding"
              body="You come to the site and start a session. It runs 24 hours, then stops and waits for you to claim. Two Ruxxells never mine at exactly the same rate."
            />
          </Rise>

          <Rise delay={100}>
            <MiningCards count={6} />
          </Rise>

          <Rise delay={200}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 30 }}>
              <Link href="/mine" className="btn">
                Open the mining rig
              </Link>
              <Link href="/worlds" className="btn btn--ghost">
                How stats are calculated
              </Link>
            </div>
          </Rise>
        </div>
      </section>

      {/* ───────────────────────────────── reconstruction */}
      <section className="band">
        <div className="wrap wrap--wide">
          <Rise>
            <Head
              eyebrow="Reconstruction"
              title="Rebuild the world and it rebuilds your rate"
              body="Fragments found while excavating go back into the world. World Integrity climbs, and every 20% pushes the Ruxxell into a new evolution stage that is visible on the NFT itself."
            />
          </Rise>

          <Rise delay={100}>
            <IntegrityDial />
          </Rise>
        </div>
      </section>

      {/* ───────────────────────────────── rarity */}
      <section className="band band--tint band--rule">
        <div className="wrap wrap--wide">
          <Rise>
            <Head
              eyebrow="Rarity"
              title="Rare gives an edge, never a guarantee"
              body="Rarity comes from the real collection metadata once all 1,970 exist — not assigned at random afterwards. A Common can still hit something extraordinary. A Legendary just has better odds over time."
            />
          </Rise>

          <Rise delay={80}>
            <div className="table-wrap">
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

          <Rise delay={140}>
            <div
              style={{
                marginTop: 26,
                padding: "22px 24px",
                borderRadius: "var(--r)",
                border: "1px solid var(--edge)",
                background: "var(--glass)",
              }}
            >
              <span className="mono" style={{ color: "var(--green)", display: "block", marginBottom: 14 }}>
                How performance resolves
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                {MULTIPLIER_CHAIN.map((m, i) => (
                  <span key={m} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <span className="chip">{m}</span>
                    {i < MULTIPLIER_CHAIN.length - 1 && (
                      <span style={{ color: "var(--faint)" }}>×</span>
                    )}
                  </span>
                ))}
              </div>
              <p className="note" style={{ marginTop: 16 }}>
                The total multiplier is capped, so nobody becomes unbalanced enough to break the
                economy.
              </p>
            </div>
          </Rise>
        </div>
      </section>

      {/* ───────────────────────────────── world types */}
      <section className="band">
        <div className="wrap wrap--wide">
          <Rise>
            <Head
              eyebrow="World types"
              title="The artwork is the spec sheet"
              body="The environment your Ruxxell lives in is not decoration. Each world type carries a small specialty, so what you are looking at tells you something about how it performs."
            />
          </Rise>

          <div className="tiles">
            {WORLD_TYPES.map((w, i) => (
              <Rise key={w.k} delay={i * 70}>
                <article className="tile" data-tone={w.tone}>
                  <span className="mono">{w.k}</span>
                  <h3>{w.d.split(".")[0]}</h3>
                  <p>{w.d.split(".").slice(1).join(".").trim()}</p>
                  <span className="tile__stat">{w.stat}</span>
                </article>
              </Rise>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────────────── resale */}
      <section className="band band--tint band--rule">
        <div className="wrap wrap--wide">
          <Rise>
            <Head
              eyebrow="Secondary value"
              title="Two Commons. Same mint day."
              body="After people start playing, a buyer is not looking at rarity alone. Progression is attached to the Ruxxell and travels with it, so these are not the same NFT any more."
            />
          </Rise>

          <div className="versus">
            <Rise delay={60}>
              <div className="vs-card">
                <div>
                  <span className="mono">Barely touched</span>
                  <h3 style={{ marginTop: 8 }}>{RESALE.untouched.label}</h3>
                </div>
                <div className="vs-rows">
                  <div className="vs-row">
                    <span>World Integrity</span>
                    <b>{RESALE.untouched.integrity}%</b>
                  </div>
                  <div className="vs-row">
                    <span>Excavation Depth</span>
                    <b>{RESALE.untouched.depth}</b>
                  </div>
                  <div className="vs-row">
                    <span>Artifacts</span>
                    <b>{RESALE.untouched.artifacts}</b>
                  </div>
                  <div className="vs-row">
                    <span>Evolution</span>
                    <b>{RESALE.untouched.stage}</b>
                  </div>
                  <div className="vs-row">
                    <span>Yield / hour</span>
                    <b>{RESALE.untouched.yield}</b>
                  </div>
                </div>
              </div>
            </Rise>

            <Rise delay={140}>
              <div className="vs-card" data-hot="1">
                <div>
                  <span className="mono">Built into</span>
                  <h3 style={{ marginTop: 8 }}>{RESALE.developed.label}</h3>
                </div>
                <div className="vs-rows">
                  <div className="vs-row">
                    <span>World Integrity</span>
                    <b style={{ color: "var(--green)" }}>{RESALE.developed.integrity}%</b>
                  </div>
                  <div className="vs-row">
                    <span>Excavation Depth</span>
                    <b style={{ color: "var(--green)" }}>{RESALE.developed.depth}</b>
                  </div>
                  <div className="vs-row">
                    <span>Artifacts</span>
                    <b style={{ color: "var(--green)" }}>{RESALE.developed.artifacts}</b>
                  </div>
                  <div className="vs-row">
                    <span>Evolution</span>
                    <b style={{ color: "var(--green)" }}>{RESALE.developed.stage}</b>
                  </div>
                  <div className="vs-row">
                    <span>Yield / hour</span>
                    <b style={{ color: "var(--green)" }}>{RESALE.developed.yield}</b>
                  </div>
                </div>
              </div>
            </Rise>
          </div>

          <Rise delay={200}>
            <p className="t-body note" style={{ marginTop: 24, maxWidth: "62ch", fontSize: "0.92rem", color: "var(--mute)" }}>
              Because the Worldvault and all progression belong to the NFT rather than the wallet, a
              buyer is not purchasing the artwork. They are purchasing the world and everything built
              inside it.
            </p>
          </Rise>
        </div>
      </section>

      {/* ───────────────────────────────── roadmap */}
      <section className="band">
        <div className="wrap">
          <Rise>
            <Head eyebrow="What happens when" title="The plan" />
          </Rise>
          <Rise delay={80}>
            <div className="timeline">
              {ROADMAP.map((p) => (
                <div className="phase" key={p.t}>
                  <span className="mono" style={{ color: "var(--green)" }}>
                    {p.k}
                  </span>
                  <b>{p.t}</b>
                  <p>{p.d}</p>
                </div>
              ))}
            </div>
          </Rise>
        </div>
      </section>

      {/* ───────────────────────────────── close */}
      <section className="band band--rule" style={{ paddingBottom: "clamp(70px, 10vw, 140px)" }}>
        <div className="wrap wrap--text">
          <Rise>
            <Head
              center
              eyebrow="The short version"
              title="The NFT is the starting point, not the end product"
              body="You activate yours. You mine with it. You earn RUXX. You explore it, discover what is inside, rebuild it, go deeper, and compete with everybody else doing the same."
            />
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/mint" className="btn btn--xl">
                Join the access list
              </Link>
              <a className="btn btn--xl btn--ghost" href={BRAND.x} target="_blank" rel="noopener noreferrer">
                <XIcon /> Follow
              </a>
            </div>
          </Rise>
        </div>
      </section>
    </>
  );
}
