import { useState } from "react";
import { EXCAVATIONS } from "@/data/utility";

/**
 * Excavation simulator. Pick a depth, run it, see what the tables return.
 * Odds come straight from EXCAVATIONS so tuning the game tunes the demo.
 */

type Find = { id: string; kind: "Fragment" | "Artifact"; name: string; qty: number; icon: string };

const FRAGMENTS = [
  { name: "Cracked plating", icon: "▚" },
  { name: "Circuit shard", icon: "▞" },
  { name: "Ore cluster", icon: "▙" },
  { name: "Frozen core sample", icon: "▟" },
  { name: "Stone tablet piece", icon: "▛" },
];

const ARTIFACTS = [
  { name: "Resonance coil", icon: "◈" },
  { name: "Vault key fragment", icon: "✦" },
  { name: "Drift compass", icon: "◉" },
  { name: "Hollow lantern", icon: "✧" },
  { name: "Sealed canister", icon: "❖" },
];

function roll(tier: (typeof EXCAVATIONS)[number]): Find[] {
  const out: Find[] = [];

  // fragments: one guaranteed roll plus extras the deeper you go
  const attempts = 1 + tier.depth;
  for (let i = 0; i < attempts; i++) {
    if (Math.random() * 100 < tier.fragment) {
      const pick = FRAGMENTS[Math.floor(Math.random() * FRAGMENTS.length)];
      out.push({
        id: `f${i}${Math.random()}`,
        kind: "Fragment",
        name: pick.name,
        icon: pick.icon,
        qty: 1 + Math.floor(Math.random() * (tier.depth + 1)),
      });
    }
  }

  if (Math.random() * 100 < tier.artifact) {
    const pick = ARTIFACTS[Math.floor(Math.random() * ARTIFACTS.length)];
    out.push({ id: `a${Math.random()}`, kind: "Artifact", name: pick.name, icon: pick.icon, qty: 1 });
  }

  return out.slice(0, 5);
}

export default function DigSim() {
  const [tier, setTier] = useState(1);
  const [finds, setFinds] = useState<Find[] | null>(null);
  const [digging, setDigging] = useState(false);
  const [runs, setRuns] = useState(0);
  const [depth, setDepth] = useState(12);

  const current = EXCAVATIONS[tier];

  function go() {
    setDigging(true);
    setFinds(null);
    window.setTimeout(() => {
      setFinds(roll(current));
      setDepth((d) => d + current.depth);
      setRuns((r) => r + 1);
      setDigging(false);
    }, 900);
  }

  return (
    <>
      <div className="digs" style={{ marginBottom: 18 }}>
        {EXCAVATIONS.map((t, i) => (
          <button
            key={t.id}
            className="dig"
            data-on={tier === i ? 1 : 0}
            onClick={() => setTier(i)}
            aria-pressed={tier === i}
          >
            <div className="dig__h">
              <h3>{t.name}</h3>
              <span className="dig__cost">{t.cost} RUXX</span>
            </div>
            <p>{t.blurb}</p>

            <div className="odds">
              <div className="odds__r">
                <div className="odds__l">
                  <span>Fragment odds</span>
                  <b>{t.fragment}%</b>
                </div>
                <div className="odds__t">
                  <div className="odds__f" style={{ width: `${t.fragment}%`, background: "var(--green)" }} />
                </div>
              </div>
              <div className="odds__r">
                <div className="odds__l">
                  <span>Artifact odds</span>
                  <b>{t.artifact}%</b>
                </div>
                <div className="odds__t">
                  <div className="odds__f" style={{ width: `${t.artifact}%`, background: "var(--magenta)" }} />
                </div>
              </div>
              <div className="odds__l" style={{ paddingTop: 2 }}>
                <span>Run time</span>
                <b>{t.hours}h</b>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="reel">
        <div className="reel__head">
          <span className="mono" style={{ color: "var(--faint)" }}>
            {digging ? "Excavating…" : finds ? `${current.name} run complete` : "Ready"}
          </span>
          <span className="chip">Depth {depth}</span>
        </div>

        {digging && (
          <div className="session">
            <div className="session__bar">
              <div className="session__fill" style={{ width: "100%", transition: "width 0.9s linear" }} />
            </div>
          </div>
        )}

        {!digging && finds && finds.length > 0 && (
          <div className="finds">
            {finds.map((f, i) => (
              <div className="find" key={f.id} style={{ animationDelay: `${i * 70}ms` }}>
                <span
                  className="find__i"
                  style={{ color: f.kind === "Artifact" ? "var(--magenta)" : "var(--green)" }}
                  aria-hidden="true"
                >
                  {f.icon}
                </span>
                <span>
                  <span className="find__n">{f.name}</span>
                  <span className="find__t" style={{ display: "block", color: f.kind === "Artifact" ? "var(--magenta)" : undefined }}>
                    {f.kind}
                  </span>
                </span>
                <span className="find__q">×{f.qty}</span>
              </div>
            ))}
          </div>
        )}

        {!digging && finds && finds.length === 0 && (
          <p className="reel__empty">
            Nothing this run. The tables are odds, not guarantees — that is the point of going deeper.
          </p>
        )}

        {!digging && !finds && (
          <p className="reel__empty">
            Pick a depth and send your Ruxxell down. Deeper runs cost more and take longer, but the
            tables get considerably better.
          </p>
        )}

        <button className="btn btn--wide" onClick={go} disabled={digging}>
          {digging ? "Digging…" : `Run ${current.name} excavation`}
        </button>

        {runs > 0 && (
          <p className="note">
            {runs} {runs === 1 ? "run" : "runs"} this visit. Every run adds Depth, and Depth unlocks
            better discovery tables permanently.
          </p>
        )}
      </div>
    </>
  );
}
