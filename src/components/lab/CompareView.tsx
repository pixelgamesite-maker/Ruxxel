import { useState, type ReactNode } from "react";
import { ASSETS, type Asset } from "@/data/assets";
import { dirClass, pct, price } from "@/lib/format";
import { Rich } from "@/components/ui/Kit";
import PerformanceChart from "@/components/compare/PerformanceChart";

const RANGES = [
  { k: "30D", n: 30 },
  { k: "90D", n: 90 },
];

const avgRisk = (a: Asset) =>
  Math.round((a.risk.liquidity + a.risk.volatility + a.risk.concentration + a.risk.custody) / 4);

function pairR(a: Asset, b: Asset): number | null {
  const hit = a.correlations.find((c) => c.symbol === b.symbol);
  if (hit) return hit.r;
  const back = b.correlations.find((c) => c.symbol === a.symbol);
  return back ? back.r : null;
}

function readOut(picked: Asset[]): string[] {
  if (picked.length < 2) return [];
  const byVol = [...picked].sort((x, y) => y.vol30d - x.vol30d);
  const byRisk = [...picked].sort((x, y) => avgRisk(y) - avgRisk(x));

  let best: { a: Asset; b: Asset; r: number } | null = null;
  for (let i = 0; i < picked.length; i++) {
    for (let j = i + 1; j < picked.length; j++) {
      const r = pairR(picked[i], picked[j]);
      if (r !== null && (!best || Math.abs(r) > Math.abs(best.r))) best = { a: picked[i], b: picked[j], r };
    }
  }

  const lines = [
    `**${byVol[0].symbol}** is the wild one at **${byVol[0].vol30d}%** volatility, against **${byVol[byVol.length - 1].vol30d}%** for ${byVol[byVol.length - 1].symbol}.`,
    `**${byRisk[0].symbol}** carries the highest risk score at **${avgRisk(byRisk[0])}/100**, mostly ${
      Object.entries(byRisk[0].risk).sort((x, y) => y[1] - x[1])[0][0]
    }.`,
  ];

  if (best) {
    lines.push(
      best.r > 0.6
        ? `**${best.a.symbol}** and **${best.b.symbol}** move together at **${best.r.toFixed(2)}**. Holding both adds size, not spread.`
        : `Closest pair is **${best.a.symbol}** and **${best.b.symbol}** at **${best.r.toFixed(2)}**, loose enough to run on different drivers.`,
    );
  }
  return lines;
}

export default function CompareView() {
  const [picked, setPicked] = useState<string[]>(["AAPLx", "NVDAx", "TBILx"]);
  const [range, setRange] = useState(1);

  const assets = ASSETS.filter((a) => picked.includes(a.symbol));
  const full = picked.length >= 4;

  const rows: { label: string; render: (a: Asset) => ReactNode }[] = [
    { label: "Price", render: (a) => price(a.price) },
    { label: "24 hours", render: (a) => <span className={dirClass(a.change24h)}>{pct(a.change24h)}</span> },
    { label: "30 days", render: (a) => <span className={dirClass(a.change30d)}>{pct(a.change30d)}</span> },
    { label: "Volatility", render: (a) => `${a.vol30d}%` },
    { label: "Market cap", render: (a) => a.marketCap },
    { label: "Liquidity", render: (a) => a.liquidity },
    { label: "Onchain 24h", render: (a) => a.onchain24h },
    { label: "Holders", render: (a) => a.holders.toLocaleString("en-US") },
    { label: "Risk score", render: (a) => `${avgRisk(a)}/100` },
    { label: "Class", render: (a) => a.cls },
    {
      label: `vs ${assets[0]?.symbol ?? "-"}`,
      render: (a) => {
        if (!assets[0]) return "-";
        if (a.symbol === assets[0].symbol) return "1.00";
        const r = pairR(assets[0], a);
        return r === null ? "-" : r.toFixed(2);
      },
    },
  ];

  return (
    <>
      <p className="note" style={{ padding: "0 16px 10px" }}>
        Pick up to four. {picked.length} selected.
      </p>

      <div className="seg">
        {ASSETS.map((a) => {
          const on = picked.includes(a.symbol);
          return (
            <button
              key={a.symbol}
              data-on={on ? 1 : 0}
              disabled={!on && full}
              aria-pressed={on}
              onClick={() =>
                setPicked((p) => (p.includes(a.symbol) ? p.filter((s) => s !== a.symbol) : p.length >= 4 ? p : [...p, a.symbol]))
              }
            >
              {a.symbol}
            </button>
          );
        })}
      </div>

      {assets.length === 0 ? (
        <p className="note" style={{ textAlign: "center", padding: "24px 16px" }}>
          Pick at least one asset to start.
        </p>
      ) : (
        <>
          <div className="sheet">
            <div className="sheet__sec" style={{ borderTop: 0 }}>
              <h4>
                <span>Rebased to 100</span>
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
              </h4>
              <PerformanceChart assets={assets} days={RANGES[range].n} />
            </div>

            <div className="sheet__sec">
              <h4>
                <span>Side by side</span>
                <span>Swipe</span>
              </h4>
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th scope="col">Metric</th>
                      {assets.map((a) => (
                        <th key={a.symbol} scope="col">
                          {a.symbol}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.label}>
                        <th scope="row">{r.label}</th>
                        {assets.map((a) => (
                          <td key={a.symbol}>{r.render(a)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {assets.length > 1 && (
              <div className="sheet__sec">
                <h4>
                  <span>The verdict</span>
                  <span style={{ color: "var(--rh)" }}>Commander</span>
                </h4>
                <div className="bubble">
                  <ul style={{ marginTop: 0 }}>
                    {readOut(assets).map((l, i) => (
                      <li key={i}>
                        <i className="bullet" />
                        <span>
                          <Rich text={l} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="note" style={{ marginTop: 12 }}>
                  Sample data. Descriptive only, not a ranking.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
