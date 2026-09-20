import { useEffect, useState } from "react";
import { ASSETS, PORTFOLIO } from "@/data/assets";
import { dirClass, pct, price } from "@/lib/format";
import { Sparkline } from "@/components/ui/Kit";

/**
 * The Lab is gated. What you see behind the panel is the real interface,
 * running on sample data and cycling through itself. It does not scroll — the
 * page changes scene on its own roughly every six seconds.
 */

const RISKS = ["Liquidity", "Volatility", "Concentration", "Custody"] as const;

function SceneRows() {
  return (
    <div className="rows">
      {ASSETS.slice(0, 6).map((a) => (
        <div className="row" key={a.symbol}>
          <span>
            <span className="row__sym">{a.symbol}</span>
            <span className="row__name">{a.name}</span>
          </span>
          <span>
            <span className="row__px">{price(a.price)}</span>
            <span className={`row__ch ${dirClass(a.change24h)}`}>{pct(a.change24h)}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function SceneChart() {
  const a = ASSETS[1];
  return (
    <div className="sheet">
      <div className="sheet__head">
        <div>
          <span className="mono" style={{ color: "var(--green)" }}>
            {a.cls} · {a.sector}
          </span>
          <h3 style={{ fontSize: "1.3rem", margin: "6px 0 0" }}>{a.name}</h3>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="sheet__px">{price(a.price)}</div>
          <div className={`num ${dirClass(a.change24h)}`} style={{ fontSize: "0.85rem" }}>
            {pct(a.change24h)}
          </div>
        </div>
      </div>
      <div style={{ padding: "0 14px 14px" }}>
        <Sparkline data={a.series} stroke="var(--green)" height={140} />
      </div>
      <div className="sheet__sec">
        <div className="kv">
          <div>
            <span>Market cap</span>
            <b>{a.marketCap}</b>
          </div>
          <div>
            <span>Liquidity</span>
            <b>{a.liquidity}</b>
          </div>
          <div>
            <span>Holders</span>
            <b>{a.holders.toLocaleString("en-US")}</b>
          </div>
          <div>
            <span>Onchain 24h</span>
            <b>{a.onchain24h}</b>
          </div>
          <div>
            <span>Volatility</span>
            <b>{a.vol30d}%</b>
          </div>
          <div>
            <span>Risk</span>
            <b>62</b>
          </div>
        </div>
      </div>
    </div>
  );
}

function SceneRisk() {
  const a = ASSETS[5];
  return (
    <div className="sheet">
      <div className="sheet__sec" style={{ borderTop: 0 }}>
        <h4>
          <span>Risk check</span>
          <span>{a.symbol}</span>
        </h4>
        <div className="meter">
          {RISKS.map((label) => {
            const key = label.toLowerCase() as keyof typeof a.risk;
            return (
              <div key={label}>
                <div className="meter__l">
                  <span>{label}</span>
                  <span>{a.risk[key]}</span>
                </div>
                <div className="meter__t">
                  <div
                    className="meter__f"
                    style={{
                      width: `${a.risk[key]}%`,
                      background: a.risk[key] >= 60 ? "var(--down)" : "var(--green)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="sheet__sec">
        <h4>
          <span>Allocation</span>
          <span>{PORTFOLIO.length} positions</span>
        </h4>
        <div className="meter">
          {PORTFOLIO.slice(0, 4).map((p) => (
            <div key={p.symbol}>
              <div className="meter__l">
                <span className="num">{p.symbol}</span>
                <span>{p.weight}%</span>
              </div>
              <div className="meter__t">
                <div className="meter__f" style={{ width: `${p.weight}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const SCENES = [<SceneRows key="rows" />, <SceneChart key="chart" />, <SceneRisk key="risk" />];

export default function Lab() {
  const [scene, setScene] = useState(0);

  // the gate owns the viewport, so nothing behind it scrolls
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setScene((s) => (s + 1) % SCENES.length), 6000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className="gate">
      <div className="gate__bg" aria-hidden="true">
        {SCENES.map((node, i) => (
          <div className="gate__scene" key={i} data-on={scene === i ? 1 : 0}>
            {node}
          </div>
        ))}
      </div>

      <div className="gate__veil" aria-hidden="true" />

      <div className="gate__fg">
        <span className="mono gate__eyebrow">The mining protocol</span>
        <h1>Ready to start mining?</h1>
        <p>
          Every Ruxxell mines $RUX from the lab it works in. Connect a wallet to check your crew,
          claim your rate and put them to work.
        </p>

        <button className="btn btn--xl" disabled aria-disabled="true">
          Connect Wallet
        </button>

        <span className="mono gate__soon">Coming soon</span>
      </div>
    </div>
  );
}
