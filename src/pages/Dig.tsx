import { Link } from "wouter";
import { Head, Rise } from "@/components/ui/Kit";
import DigSim from "@/components/dig/DigSim";
import IntegrityDial from "@/components/home/IntegrityDial";

const FINDS = [
  {
    k: "Fragments",
    tone: "green",
    t: "The building material",
    d: "Common enough to find on most runs. Fragments are what you spend on reconstruction, so they convert directly into World Integrity.",
  },
  {
    k: "Artifacts",
    tone: "pink",
    t: "The rare pull",
    d: "Much harder to surface. Some are purely collectible, some carry real boosts to Hash, Yield, excavation odds or reconstruction efficiency.",
  },
  {
    k: "Worldvault",
    tone: "cyan",
    t: "Where it all lives",
    d: "Every Ruxxell owns a vault of its own. Whatever it discovers stays attached to the NFT, so it transfers with the NFT when it sells.",
  },
];

export default function Dig() {
  return (
    <>
      <section className="band" style={{ paddingBottom: "clamp(30px, 4vw, 50px)" }}>
        <div className="wrap wrap--wide">
          <Rise>
            <Head
              eyebrow="Excavation"
              title="Mining is the reward. This is the game."
              body="Spend RUXX to send your Ruxxell deeper into its own fragment. Pick a depth and run it — the odds below are the real tables."
            />
          </Rise>
          <Rise delay={100}>
            <DigSim />
          </Rise>
        </div>
      </section>

      <section className="band band--tint band--rule">
        <div className="wrap wrap--wide">
          <Rise>
            <Head eyebrow="Discoveries" title="What comes back up" />
          </Rise>
          <div className="tiles">
            {FINDS.map((f, i) => (
              <Rise key={f.k} delay={i * 80}>
                <article className="tile" data-tone={f.tone}>
                  <span className="mono">{f.k}</span>
                  <h3>{f.t}</h3>
                  <p>{f.d}</p>
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
              eyebrow="Reconstruction"
              title="Spend what you found, raise what you own"
              body="Fragments go back into the world. Integrity climbs, evolution stages unlock, and the Ruxxell you end up with is measurably different from the one you minted."
            />
          </Rise>
          <Rise delay={100}>
            <IntegrityDial />
          </Rise>
          <Rise delay={200}>
            <div style={{ marginTop: 34 }}>
              <Link href="/worlds" className="btn">
                See how worlds differ
              </Link>
            </div>
          </Rise>
        </div>
      </section>
    </>
  );
}
