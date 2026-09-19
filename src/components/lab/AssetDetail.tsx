import { useState } from "react";
import type { Asset } from "@/data/assets";
import { dirClass, pct, price } from "@/lib/format";
import { Rich, Sparkline } from "@/components/ui/Kit";
import AskPanel from "./AskPanel";

const RANGES = [
  { k: "30D", n: 30 },
  { k: "90D", n: 90 },
];

const RISKS: { k: keyof Asset["risk"]; label: string }[] = [
  { k: "liquidity", label: "Liquidity" },
  { k: "volatility", label: "Volatility" },
  { k: "concentration", label: "Concentration" },
  { k: "custody", label: "Custody" },
];

export default function AssetDetail({ asset }: { asset: Asset }) {
  const [range, setRange] = useState(1);
  const series = asset.series.slice(-RANGES[range].n);
  const move = ((series[series.length - 1] - series[0]) / series[0]) * 100;
  const overall = Math.round(
    (asset.risk.liquidity + asset.risk.volatility + asset.risk.concentration + asset.risk.custody) / 4,
  );

  return (
    <div className="sheet">
      <div className="sheet__head">
        <div>
          <span className="mono" style={{ color: "var(--rh)" }}>
            {asset.cls} · {asset.sector}
          </span>
          <h3 style={{ fontSize: "1.3rem", margin: "4px 0 0" }}>{asset.name}</h3>
          <span className="row__sym" style={{ color: "var(--faint)" }}>
            {asset.symbol}
          </span>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="sheet__px">{price(asset.price)}</div>
          <div className={`num ${dirClass(asset.change24h)}`} style={{ fontSize: "0.85rem" }}>
            {pct(asset.change24h)} today
          </div>
        </div>
      </div>

      <div style={{ padding: "0 14px 10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 6px 6px" }}>
          <span className="mono" style={{ color: "var(--faint)" }}>
            {RANGES[range].k} <span className={dirClass(move)}>{pct(move)}</span>
          </span>
          <span style={{ display: "flex", gap: 6 }}>
            {RANGES.map((r, i) => (
              <button
                key={r.k}
                className={`chip ${range === i ? "chip--on" : ""}`}
                onClick={() => setRange(i)}
                aria-pressed={range === i}
              >
                {r.k}
              </button>
            ))}
          </span>
        </div>
        <Sparkline data={series} stroke={move >= 0 ? "var(--rh)" : "var(--down)"} height={120} />
      </div>

      <div className="sheet__sec">
        <h4>
          <span>The numbers</span>
          <span>Sample data</span>
        </h4>
        <div className="kv">
          <div>
            <span>Market cap</span>
            <b>{asset.marketCap}</b>
          </div>
          <div>
            <span>Liquidity</span>
            <b>{asset.liquidity}</b>
          </div>
          <div>
            <span>Holders</span>
            <b>{asset.holders.toLocaleString("en-US")}</b>
          </div>
          <div>
            <span>Onchain 24h</span>
            <b>{asset.onchain24h}</b>
          </div>
          <div>
            <span>Volatility</span>
            <b>{asset.vol30d}%</b>
          </div>
          <div>
            <span>Risk score</span>
            <b className={overall >= 55 ? "down" : ""}>{overall}</b>
          </div>
        </div>
      </div>

      <div className="sheet__sec">
        <h4>
          <span>Risk check</span>
          <span>0 chill · 100 spicy</span>
        </h4>
        <div className="meter">
          {RISKS.map(({ k, label }) => (
            <div key={k}>
              <div className="meter__l">
                <span>{label}</span>
                <span>{asset.risk[k]}</span>
              </div>
              <div className="meter__t">
                <div
                  className="meter__f"
                  style={{
                    width: `${asset.risk[k]}%`,
                    background: asset.risk[k] >= 60 ? "var(--down)" : "var(--rh)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sheet__sec">
        <h4>
          <span>Onchain</span>
          <span>Last 24h</span>
        </h4>
        <div className="feed">
          {asset.flows.map((f, i) => (
            <div className="feed__i" key={i}>
              <span className="feed__t">{f.t}</span>
              <span className="feed__x">
                <Rich text={f.x} />
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="sheet__sec">
        <h4>
          <span>Moves with</span>
          <span>90 day</span>
        </h4>
        <div className="meter">
          {asset.correlations.map((c) => (
            <div key={c.symbol}>
              <div className="meter__l">
                <span className="num">{c.symbol}</span>
                <span>{c.r.toFixed(2)}</span>
              </div>
              <div className="meter__t">
                <div
                  className="meter__f"
                  style={{
                    width: `${Math.abs(c.r) * 100}%`,
                    background: c.r < 0 ? "var(--cyan)" : "var(--rh)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {asset.events.length > 0 && (
        <div className="sheet__sec">
          <h4>
            <span>What happened</span>
            <span>Recent</span>
          </h4>
          <div className="feed">
            {asset.events.map((e, i) => (
              <div className="feed__i" key={i}>
                <span className="feed__t">{e.t}</span>
                <span className="feed__x">{e.x}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <AskPanel asset={asset} />
    </div>
  );
}
