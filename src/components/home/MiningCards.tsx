import { useEffect, useState } from "react";
import { MINERS, RARITY_TONE, type Miner } from "@/data/miners";
import { Pixel } from "@/components/ui/Kit";

/** Small bounded random walk so the numbers breathe instead of jumping. */
function drift(base: number, spread: number, current: number) {
  const pull = (base - current) * 0.18; // keeps it honest around the base
  const noise = (Math.random() - 0.5) * spread;
  return current + pull + noise;
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

function MinerCard({ miner, delay }: { miner: Miner; delay: number }) {
  const [hash, setHash] = useState(miner.hash);
  const [rux, setRux] = useState(miner.rux);
  const [mined, setMined] = useState(() => miner.rux * (2 + Math.random() * 6));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tick = 0;
    const start = window.setTimeout(() => {
      tick = window.setInterval(() => {
        setHash((h) => drift(miner.hash, miner.hash * 0.07, h));
        setRux((r) => drift(miner.rux, miner.rux * 0.05, r));
        setMined((m) => m + miner.rux / 1800);
      }, 1400);
    }, delay);

    return () => {
      window.clearTimeout(start);
      window.clearInterval(tick);
    };
  }, [miner, delay]);

  const tone = `var(--${miner.tone === "pink" ? "magenta" : miner.tone === "purple" ? "violet" : miner.tone})`;
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
          <b className="num">{miner.token}</b>
          <span className="miner__live">
            <i className="dot" /> mining
          </span>
        </div>

        <span className="tag" data-tone={miner.tone}>
          {miner.role} · {miner.world}
        </span>

        <Bars level={level} tone={tone} />

        <dl className="miner__kv">
          <div>
            <dt>Hash</dt>
            <dd className="num">{hash.toFixed(0)} H/s</dd>
          </div>
          <div>
            <dt>Yield</dt>
            <dd className="num" style={{ color: tone }}>
              {rux.toFixed(1)} $RUX/h
            </dd>
          </div>
          <div>
            <dt>Mined</dt>
            <dd className="num">{mined.toFixed(2)}</dd>
          </div>
          <div>
            <dt>Uptime</dt>
            <dd className="num">{miner.uptime}%</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

export default function MiningCards() {
  return (
    <div className="miners">
      {MINERS.map((m, i) => (
        <MinerCard key={m.id} miner={m} delay={i * 220} />
      ))}
    </div>
  );
}
