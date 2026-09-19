import { useEffect, useState } from "react";
import type { Asset } from "@/data/assets";
import { pct } from "@/lib/format";
import { Rich } from "@/components/ui/Kit";

type Answer = { lead: string; points: string[]; by: string };

const PRESETS = ["Why did it move?", "How risky is it?", "What does it track?", "Anything weird onchain?"];

const level = (n: number) => (n >= 60 ? "high" : n >= 35 ? "moderate" : "low");

function compose(a: Asset, q: string): Answer {
  const query = q.toLowerCase();

  if (/(risk|safe|danger|worry|careful)/.test(query)) {
    const ranked = Object.entries(a.risk).sort((x, y) => y[1] - x[1]);
    const [topName, topVal] = ranked[0];
    const [secName, secVal] = ranked[1];
    return {
      by: "Engineer",
      lead: `${topName[0].toUpperCase()}${topName.slice(1)} is the one to watch on ${a.symbol}, scored ${topVal} out of 100.`,
      points: [
        `**${topName}** reads ${level(topVal)} at ${topVal}. ${a.flows[0]?.x ?? "Onchain activity looks normal."}`,
        `**${secName}** is next at ${secVal}, ${level(secVal)} for something this size.`,
        `Pool depth is **${a.liquidity}** against **${a.onchain24h}** traded today.`,
      ],
    };
  }

  if (/(correlat|diversif|overlap|together|hedge)/.test(query)) {
    const sorted = [...a.correlations].sort((x, y) => Math.abs(y.r) - Math.abs(x.r));
    const inverse = [...a.correlations].sort((x, y) => x.r - y.r)[0];
    return {
      by: "Commander",
      lead: `${a.symbol} moves closest with ${sorted[0].symbol} over the last 90 days.`,
      points: [
        `**${sorted[0].symbol}** at **${sorted[0].r.toFixed(2)}**. Holding both is close to holding more of one.`,
        `**${inverse.symbol}** is the loosest at **${inverse.r.toFixed(2)}**, so it offsets instead of doubling up.`,
        `Sector exposure is **${a.sector}**, filed under ${a.cls.toLowerCase()}.`,
      ],
    };
  }

  if (/(what is|track|explain|about|back|custody|structure)/.test(query)) {
    return {
      by: "Scientist",
      lead: a.summary,
      points: [
        `Filed as **${a.cls}** in **${a.sector}**.`,
        `**${a.holders.toLocaleString("en-US")}** holders, market cap **${a.marketCap}**.`,
        `Custody scores **${a.risk.custody}/100**, ${level(a.risk.custody)} for this kind of asset.`,
      ],
    };
  }

  if (/(onchain|weird|unusual|flow|wallet|transfer)/.test(query)) {
    return {
      by: "Engineer",
      lead: `Here is what the chain shows on ${a.symbol} right now.`,
      points: a.flows.length
        ? a.flows.map((f) => `${f.x} (${f.t} ago).`)
        : ["Transfers are running at their usual rate. Nothing worth waking anyone up for."],
    };
  }

  return {
    by: "Trader",
    lead: `${a.symbol} is ${pct(a.change24h)} today and ${pct(a.change30d)} over 30 days. ${a.driver}.`,
    points: [
      `Realised volatility is **${a.vol30d}%**, so a move this size is ${
        Math.abs(a.change24h) > a.vol30d / 12 ? "**outside**" : "**inside**"
      } its normal day.`,
      a.flows[0]?.x ?? "Transfers are running at their usual rate.",
      a.events[0] ? `Context: ${a.events[0].x.toLowerCase()} (${a.events[0].t} ago).` : "No market events logged lately.",
    ],
  };
}

export default function AskPanel({ asset }: { asset: Asset }) {
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState<Answer>(() => compose(asset, "why did it move"));

  useEffect(() => {
    setAnswer(compose(asset, "why did it move"));
    setQ("");
  }, [asset]);

  function ask(text: string) {
    if (text.trim()) setAnswer(compose(asset, text));
  }

  return (
    <div className="sheet__sec">
      <h4>
        <span>Ask the crew</span>
        <span style={{ color: "var(--rh)" }}>{answer.by} answered</span>
      </h4>

      <div className="ask">
        <input
          className="input"
          placeholder={`Ask about ${asset.symbol}...`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask(q)}
          aria-label={`Ask about ${asset.symbol}`}
        />
        <button className="btn btn--sm" onClick={() => ask(q)} disabled={!q.trim()}>
          Ask
        </button>
      </div>

      <div className="seg" style={{ padding: "0 0 12px" }}>
        {PRESETS.map((p) => (
          <button key={p} onClick={() => { setQ(p); ask(p); }}>
            {p}
          </button>
        ))}
      </div>

      <div className="bubble">
        {answer.lead}
        <ul>
          {answer.points.map((p, i) => (
            <li key={i}>
              <i className="bullet" />
              <span>
                <Rich text={p} />
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="note" style={{ marginTop: 12 }}>
        Built from the data on this card. Research, not advice.
      </p>
    </div>
  );
}
