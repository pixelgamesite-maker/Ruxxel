import { Link } from "wouter";
import { LEADERBOARD, BOARDS, RAFFLES } from "@/data/utility";
import { Head, Rise } from "@/components/ui/Kit";
import MiningRig from "@/components/mine/MiningRig";
import MiningCards from "@/components/home/MiningCards";

const STATS = [
  { k: "HASH", d: "Mining strength. Driven by rarity, traits and how far the world has been rebuilt." },
  { k: "YIELD", d: "RUXX Points produced per hour at the current multiplier." },
  { k: "MINED", d: "What the running session has accumulated so far, claimable when it ends." },
  { k: "UPTIME", d: "How long this Ruxxell has been active across all sessions." },
  { k: "INTEGRITY", d: "How complete the world is. Higher integrity lifts everything else." },
  { k: "DEPTH", d: "How far excavation has gone. Depth unlocks better discovery tables." },
];

export default function Mine() {
  return (
    <>
      <section className="band" style={{ paddingBottom: "clamp(30px, 4vw, 50px)" }}>
        <div className="wrap wrap--wide">
          <Rise>
            <Head
              eyebrow="Mining"
              title="Start a session and watch it run"
              body="Pick a Ruxxell, start mining, stop early if you want, then claim. This is the real flow at demo speed — one simulated hour every quarter second."
            />
          </Rise>
          <Rise delay={100}>
            <MiningRig />
          </Rise>
        </div>
      </section>

      <section className="band band--tint band--rule">
        <div className="wrap wrap--wide">
          <Rise>
            <Head
              eyebrow="The dashboard"
              title="Why a Ruxxell performs the way it does"
              body="Every number on a card traces back to something real about that NFT. Nothing is hidden behind a single opaque score."
            />
          </Rise>
          <div className="tiles">
            {STATS.map((s, i) => (
              <Rise key={s.k} delay={i * 60}>
                <article className="tile" data-tone="green">
                  <span className="mono">{s.k}</span>
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
            <Head eyebrow="Your crew" title="Every Ruxxell you hold, on one dashboard" body="Own one, see one. Own ten, all ten show up with their own stats and their own progression." />
          </Rise>
          <Rise delay={100}>
            <MiningCards count={9} />
          </Rise>
        </div>
      </section>

      <section className="band band--tint band--rule">
        <div className="wrap wrap--wide">
          <Rise>
            <Head eyebrow="Leaderboards" title="Something to chase besides claiming" />
          </Rise>

          <Rise delay={70}>
            <div className="seg" style={{ marginBottom: 20 }}>
              {BOARDS.map((b, i) => (
                <button key={b} data-on={i === 0 ? 1 : 0} disabled={i > 0}>
                  {b}
                </button>
              ))}
            </div>
          </Rise>

          <Rise delay={120}>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Rank</th>
                    <th scope="col">Ruxxell</th>
                    <th scope="col">World</th>
                    <th scope="col">Depth</th>
                    <th scope="col">Integrity</th>
                    <th scope="col">RUXX mined</th>
                  </tr>
                </thead>
                <tbody>
                  {LEADERBOARD.map((r) => (
                    <tr key={r.token}>
                      <td>
                        <span className="table__rank">{r.rank}</span>
                      </td>
                      <td>{r.token}</td>
                      <td style={{ fontFamily: "var(--sans)", color: "var(--mute)" }}>{r.world}</td>
                      <td>{r.depth}</td>
                      <td>{r.integrity}%</td>
                      <td style={{ color: "var(--green)" }}>{r.ruxx}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Rise>
        </div>
      </section>

      <section className="band">
        <div className="wrap wrap--wide">
          <Rise>
            <Head eyebrow="Raffles" title="A reward layer that leaves the economy alone" body="Activity inside the ecosystem earns entries. It rewards people for playing without inflating what mining is worth." />
          </Rise>
          <div className="tiles">
            {RAFFLES.map((r, i) => (
              <Rise key={r.k} delay={i * 60}>
                <article className="tile" data-tone="purple">
                  <span className="mono">{r.k}</span>
                  <p>{r.d}</p>
                </article>
              </Rise>
            ))}
          </div>
          <Rise delay={240}>
            <div style={{ marginTop: 30 }}>
              <Link href="/dig" className="btn">
                Next: spend it on excavation
              </Link>
            </div>
          </Rise>
        </div>
      </section>
    </>
  );
}
