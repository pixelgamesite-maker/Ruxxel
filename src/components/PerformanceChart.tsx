import type { Asset } from "@/data/assets";

const LINES = ["var(--rh)", "var(--cyan)", "var(--pink)", "var(--yellow)"];

/** Rebases every series to 100 so different price scales sit on one axis. */
export default function PerformanceChart({ assets, days }: { assets: Asset[]; days: number }) {
  const width = 620;
  const height = 180;
  const pad = 12;

  const series = assets.map((a) => {
    const raw = a.series.slice(-days);
    return raw.map((v) => (v / raw[0]) * 100);
  });

  const all = series.flat();
  const min = Math.min(...all, 100);
  const max = Math.max(...all, 100);
  const span = max - min || 1;

  const path = (values: number[]) =>
    values
      .map((v, i) => {
        const x = (i / (values.length - 1)) * width;
        const y = height - pad - ((v - min) / span) * (height - pad * 2);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

  const baseY = height - pad - ((100 - min) / span) * (height - pad * 2);

  return (
    <>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Rebased performance over ${days} days for ${assets.map((a) => a.symbol).join(", ")}`}
      >
        <line
          x1="0"
          x2={width}
          y1={baseY}
          y2={baseY}
          stroke="var(--line-2)"
          strokeDasharray="3 5"
          vectorEffect="non-scaling-stroke"
        />
        {series.map((s, i) => (
          <path
            key={assets[i].symbol}
            d={path(s)}
            fill="none"
            stroke={LINES[i % LINES.length]}
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      <div className="legend">
        {assets.map((a, i) => {
          const s = series[i];
          const change = s[s.length - 1] - 100;
          return (
            <span key={a.symbol}>
              <i style={{ background: LINES[i % LINES.length] }} />
              <span className="num">{a.symbol}</span>
              <span className={change >= 0 ? "up" : "down"}>
                {change >= 0 ? "+" : ""}
                {change.toFixed(1)}%
              </span>
            </span>
          );
        })}
      </div>
    </>
  );
}
