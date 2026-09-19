import { useMemo } from "react";
import { dirClass, pct } from "@/lib/format";
import { Rich } from "@/components/ui/Kit";
import {
  BOOK,
  buildHoldings,
  byClass,
  clusteredWeight,
  correlation,
  money,
  riskContribution,
  weightedChange,
  weightedVolatility,
} from "@/components/portfolio/calc";

const TONE: Record<string, string> = {
  Equity: "var(--rh)",
  Fund: "var(--cyan)",
  Treasury: "var(--yellow)",
  Commodity: "var(--orange)",
  Private: "var(--purple)",
};

export default function PortfolioView() {
  const holdings = useMemo(buildHoldings, []);

  const day = weightedChange(holdings, "change24h");
  const month = weightedChange(holdings, "change30d");
  const vol = weightedVolatility(holdings);
  const risk = riskContribution(holdings);
  const classes = byClass(holdings);
  const clustered = clusteredWeight(holdings);
  const top3 = [...holdings].sort((a, b) => b.weight - a.weight).slice(0, 3);
  const top3Weight = top3.reduce((s, h) => s + h.weight, 0);
  const thinnest = [...holdings].sort((a, b) => b.asset.risk.liquidity - a.asset.risk.liquidity)[0];

  const read = [
    `**${clustered.toFixed(0)}%** of the bag sits in things that move together above **0.60**. Six positions, but it behaves like fewer.`,
    `**${risk[0].symbol}** drives **${risk[0].share.toFixed(0)}%** of your volatility from a **${holdings.find((h) => h.asset.symbol === risk[0].symbol)?.weight}%** slice.`,
    `**${thinnest.asset.symbol}** is the hardest to get out of, scored **${thinnest.asset.risk.liquidity}/100** on liquidity against **${money(thinnest.value)}**.`,
  ];

  return (
    <>
      <div className="stats" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        <div className="stat">
          <b>{money(BOOK)}</b>
          <span>Book value</span>
        </div>
        <div className="stat">
          <b className={dirClass(day)}>{pct(day)}</b>
          <span>Today</span>
        </div>
        <div className="stat">
          <b className={dirClass(month)}>{pct(month)}</b>
          <span>30 days</span>
        </div>
        <div className="stat">
          <b className={top3Weight > 70 ? "down" : ""}>{top3Weight}%</b>
          <span>Top 3 weight</span>
        </div>
      </div>

      <div className="sheet">
        <div className="sheet__sec" style={{ borderTop: 0 }}>
          <h4>
            <span>Allocation</span>
            <span>{holdings.length} positions</span>
          </h4>

          <div className="bar-stack">
            {classes.map((c) => (
              <i key={c.cls} style={{ width: `${c.weight}%`, background: TONE[c.cls] ?? "var(--mute)" }} title={`${c.cls} ${c.weight}%`} />
            ))}
          </div>

          <div className="meter">
            {holdings.map((h) => (
              <div key={h.asset.symbol}>
                <div className="meter__l">
                  <span className="num">{h.asset.symbol}</span>
                  <span>
                    {h.weight}% · {money(h.value)}
                  </span>
                </div>
                <div className="meter__t">
                  <div className="meter__f" style={{ width: `${h.weight}%`, background: TONE[h.asset.cls] ?? "var(--rh)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sheet__sec">
          <h4>
            <span>Who is driving the risk</span>
            <span>Weighted volatility {vol.toFixed(1)}%</span>
          </h4>
          <div className="meter">
            {risk.map((r) => (
              <div key={r.symbol}>
                <div className="meter__l">
                  <span className="num">{r.symbol}</span>
                  <span>{r.share.toFixed(0)}%</span>
                </div>
                <div className="meter__t">
                  <div
                    className="meter__f"
                    style={{ width: `${r.share}%`, background: r.share > 30 ? "var(--down)" : "var(--rh)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sheet__sec">
          <h4>
            <span>Overlap</span>
            <span>90 day</span>
          </h4>
          <div className="matrix">
            <table>
              <thead>
                <tr>
                  <th />
                  {holdings.map((h) => (
                    <th key={h.asset.symbol} scope="col">
                      {h.asset.symbol}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {holdings.map((row) => (
                  <tr key={row.asset.symbol}>
                    <th scope="row">{row.asset.symbol}</th>
                    {holdings.map((col) => {
                      const r = correlation(row.asset, col.asset);
                      const hot = r !== null && r >= 0.7 && row.asset.symbol !== col.asset.symbol;
                      return (
                        <td
                          key={col.asset.symbol}
                          style={{
                            color: hot ? "var(--rh)" : r === null ? "var(--faint)" : "var(--text)",
                            background: hot ? "rgba(0,224,90,0.12)" : undefined,
                          }}
                        >
                          {r === null ? "-" : r.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="sheet__sec">
          <h4>
            <span>Commander says</span>
            <span style={{ color: "var(--pink)" }}>Portfolio level</span>
          </h4>
          <div className="bubble">
            <ul style={{ marginTop: 0 }}>
              {read.map((l, i) => (
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
            Sample book. Connect a wallet at launch to load your own.
          </p>
        </div>
      </div>
    </>
  );
}
