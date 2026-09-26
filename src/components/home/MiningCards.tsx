import { useEffect, useState } from "react";
import { MINERS, RARITY_TONE, type Miner } from "@/data/miners";
import { Pixel } from "@/components/ui/Kit";

/** Bounded random walk so numbers breathe rather than jump. */
function drift(base: number, spread: number, current: number) {
  const pull = (base - current) * 0.18;
  return current + pull + (Math.random() - 0.5) * spread;
}

function Bars({ level, tone }: { level: number; tone: string }) {
  const lit = Math.round(level * 12);
  return (
    <div className="bars" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => (
        <i key={i} style={{ background: i < lit ? tone : undefined, opacity: i < lit ? 1 : 0.16 }} />
      ))}
    </div>
  );
}

const toneVar = (t: Miner["tone"]) =>
  `var(--${t === "pink" ? "magenta" : t === "purple" ? "violet" : t})`;

function MinerCard({ miner, delay }: { miner: Miner; delay: number }) {
  const [hash, setHash] = useState(miner.hash);
  const [rate, setRate] = useState(miner.yield);
  const [mined, setMined] = useState(() => miner.yield * (2 + Math.random() * 6));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tick = 0;
    const start = window.setTimeout(() => {
      tick = window.setInterval(() => {
        setHash((h) => drift(miner.hash, miner.hash * 0.07, h));
        setRate((r) => drift(miner.yield, miner.yield * 0.05, r));
        setMined((m) => m + miner.yield / 1800);
      }, 1400);
    }, delay);

    return () => {
      window.clearTimeout(start);
      window.clearInterval(tick);
    };
  }, [miner, delay]);

  const tone = toneVar(miner.tone);
  const level = Math.min(1, hash / (miner.hash * 1.25));

  return (
    <article className="miner" data-tone={miner.tone}>
      <div className="miner__art">
        <Pixel src={miner.art} alt={`Ruxxell ${miner.token}`} label={miner.token} />
        <span className="miner__rarity" style={{ color: RARITY_TONE[miner.rarity] }}>
          {miner.rarity}
        </span>
      </div>

      <div className="miner__b">
        <div className="miner__top">
          <b>{miner.token}</b>
          <span className="miner__live">
            <i className="dot" /> mining
          </span>
        </div>

        <span className="miner__meta" style={{ color: tone }}>
          {miner.world} · rank #{miner.rank}
        </span>

        <Bars level={level} tone={tone} />

        <dl className="miner__kv">
          <div>
            <dt>Hash</dt>
            <dd>{hash.toFixed(0)}</dd>
          </div>
          <div>
            <dt>Yield</dt>
            <dd style={{ color: tone }}>{rate.toFixed(1)}/h</dd>
          </div>
          <div>
            <dt>Mined</dt>
            <dd>{mined.toFixed(2)}</dd>
          </div>
          <div>
            <dt>Integrity</dt>
            <dd>{miner.integrity}%</dd>
          </div>
          <div>
            <dt>Depth</dt>
            <dd>{miner.depth}</dd>
          </div>
          <div>
            <dt>Artifacts</dt>
            <dd>{miner.artifacts}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

export default function MiningCards({ count = 6 }: { count?: number }) {
  return (
    <div className="miners">
      {MINERS.slice(0, count).map((m, i) => (
        <MinerCard key={m.id} miner={m} delay={i * 220} />
      ))}
    </div>
  );
}
