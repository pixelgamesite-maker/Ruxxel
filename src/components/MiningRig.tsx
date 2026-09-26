import { useEffect, useRef, useState } from "react";
import { MINERS, RARITY_TONE } from "@/data/miners";
import { Media } from "@/components/ui/Kit";

/**
 * Playable mining rig.
 *
 * A session runs for 24 hours in production. Here one simulated hour passes
 * every 250ms so the whole cycle is visible in about six seconds — enough to
 * show what start, stop and claim actually do.
 */

const SESSION_HOURS = 24;
const MS_PER_HOUR = 250;

type Phase = "idle" | "running" | "done";

export default function MiningRig() {
  const [pick, setPick] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [hours, setHours] = useState(0);
  const [banked, setBanked] = useState(0);
  const timer = useRef(0);

  const miner = MINERS[pick];
  const mined = hours * miner.yield;

  useEffect(() => {
    if (phase !== "running") return;

    timer.current = window.setInterval(() => {
      setHours((h) => {
        if (h + 1 >= SESSION_HOURS) {
          setPhase("done");
          return SESSION_HOURS;
        }
        return h + 1;
      });
    }, MS_PER_HOUR);

    return () => window.clearInterval(timer.current);
  }, [phase]);

  function swap(i: number) {
    setPick(i);
    setPhase("idle");
    setHours(0);
  }

  function claim() {
    setBanked((b) => b + mined);
    setHours(0);
    setPhase("idle");
  }

  const pctDone = (hours / SESSION_HOURS) * 100;
  const remaining = SESSION_HOURS - hours;

  return (
    <>
      <div className="seg" style={{ marginBottom: 18 }}>
        {MINERS.slice(0, 6).map((m, i) => (
          <button key={m.id} data-on={pick === i ? 1 : 0} onClick={() => swap(i)} aria-pressed={pick === i}>
            {m.token}
          </button>
        ))}
      </div>

      <div className="rig" data-on={phase === "running" ? 1 : 0}>
        <div className="rig__art">
          <Media src={miner.art} alt={`Ruxxell ${miner.token}`} />
          <div className="rig__scan" aria-hidden="true" />
          <span className="rig__badge">
            {phase === "running" && <i className="dot" />}
            {phase === "running" ? "Session live" : phase === "done" ? "Session complete" : "Idle"}
          </span>
        </div>

        <div className="rig__b">
          <div className="rig__counter">
            <b style={{ color: phase === "idle" ? "var(--faint)" : "var(--green)" }}>
              {mined.toFixed(2)}
            </b>
            <span>RUXX Points this session</span>
          </div>

          <div className="session">
            <div className="session__t">
              <span>
                {phase === "done"
                  ? "Session finished"
                  : phase === "running"
                    ? `${remaining}h remaining`
                    : `${SESSION_HOURS}h session`}
              </span>
              <span>{Math.round(pctDone)}%</span>
            </div>
            <div className="session__bar">
              <div className="session__fill" style={{ width: `${pctDone}%` }} />
            </div>
          </div>

          <dl className="rig__grid">
            <div className="rig__cell">
              <dt>Hash</dt>
              <dd>{miner.hash}</dd>
            </div>
            <div className="rig__cell">
              <dt>Yield / h</dt>
              <dd style={{ color: "var(--green)" }}>{miner.yield.toFixed(1)}</dd>
            </div>
            <div className="rig__cell">
              <dt>Integrity</dt>
              <dd>{miner.integrity}%</dd>
            </div>
            <div className="rig__cell">
              <dt>Depth</dt>
              <dd>{miner.depth}</dd>
            </div>
          </dl>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <span className="chip" style={{ color: RARITY_TONE[miner.rarity] }}>
              {miner.rarity}
            </span>
            <span className="chip">Rank #{miner.rank}</span>
            <span className="chip">{miner.worldType}</span>
            <span className="chip">{miner.stage}</span>
          </div>

          <div className="rig__actions">
            {phase === "idle" && (
              <button className="btn" onClick={() => setPhase("running")}>
                Start mining
              </button>
            )}
            {phase === "running" && (
              <button className="btn btn--danger" onClick={() => setPhase("done")}>
                Stop mining
              </button>
            )}
            {phase === "done" && (
              <button className="btn" onClick={claim}>
                Claim {mined.toFixed(0)} RUXX
              </button>
            )}
            {banked > 0 && (
              <span className="chip" style={{ color: "var(--green)" }}>
                Banked {banked.toFixed(0)}
              </span>
            )}
          </div>

          <p className="note">
            Demo speed. A real session runs the full 24 hours, then waits for you to claim and start
            the next one.
          </p>
        </div>
      </div>
    </>
  );
}
