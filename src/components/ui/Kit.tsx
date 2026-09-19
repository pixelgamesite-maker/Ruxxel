import { useState, type ReactNode } from "react";
import { LOGO_CANDIDATES } from "@/data/site";

/* ------------------------------------------------------------------ mark -- */

/** Stacked isometric tiles — the worlds the crew works in, seen from above. */
export function Mark({ size = 26, color = "#06210f" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M14 3 25 9 14 15 3 9 14 3Z" fill={color} />
      <path d="M4.6 13 14 18.2 23.4 13 25 14 14 20.4 3 14l1.6-1Z" fill={color} opacity="0.62" />
      <path d="M4.6 18.6 14 23.8 23.4 18.6 25 19.6 14 26 3 19.6l1.6-1Z" fill={color} opacity="0.32" />
    </svg>
  );
}

/** Brand tile. Tries each logo filename in turn, falls back to the drawn mark. */
export function Logo({ size = 42, radius = 13 }: { size?: number; radius?: number }) {
  const [attempt, setAttempt] = useState(0);
  const src = LOGO_CANDIDATES[attempt];

  return (
    <span className="logo" style={{ width: size, height: size, borderRadius: radius }}>
      {src ? (
        <img src={src} alt="" onError={() => setAttempt((a) => a + 1)} />
      ) : (
        <Mark size={Math.round(size * 0.54)} color="var(--green)" />
      )}
    </span>
  );
}

export function XIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ pixel -- */

/** Drops in a Ruxxell. Shows a labelled slot if the file is not in /public yet. */
export function Pixel({ src, alt, label }: { src: string; alt: string; label?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="pix pix--ph" role="img" aria-label={alt}>
        {label ?? src.replace("/", "")}
      </div>
    );
  }
  return (
    <div className="pix">
      <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
    </div>
  );
}

/** 16:9 art slot used at the top of a card. */
export function CardArt({ src, alt, pill }: { src: string; alt: string; pill?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="card__art">
      {failed ? (
        <div className="pix pix--ph" style={{ height: "100%", borderRadius: 0, border: 0 }}>
          {src.replace("/", "")}
        </div>
      ) : (
        <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
      )}
      {pill && <span className="pill">{pill}</span>}
    </div>
  );
}

/* ------------------------------------------------------------------- misc -- */

export function Section({ title, meta, children }: { title: string; meta?: string; children: ReactNode }) {
  return (
    <section className="sec">
      <div className="sec__h">
        <h2>{title}</h2>
        {meta && <span className="mono">{meta}</span>}
      </div>
      {children}
    </section>
  );
}

/** Renders **bold** inside a plain string. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? <b key={i}>{p.slice(2, -2)}</b> : <span key={i}>{p}</span>,
      )}
    </>
  );
}

export function Sparkline({
  data,
  height = 110,
  stroke = "var(--rh)",
}: {
  data: number[];
  height?: number;
  stroke?: string;
}) {
  if (data.length < 2) return null;
  const width = 560;
  const pad = 8;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * width,
    height - pad - ((v - min) / span) * (height - pad * 2),
  ]);
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const id = `sp${Math.round(min * 100)}${data.length}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      role="img"
      aria-label="Price history"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.3" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${width},${height} L0,${height} Z`} fill={`url(#${id})`} />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Compact market strip. Reads whatever you pass it, so it works with live data too. */
export function Ticker({ items }: { items: { symbol: string; value: string; dir: number }[] }) {
  return (
    <div className="ticker" role="list" aria-label="Market snapshot">
      {items.map((i) => (
        <div className="ticker__i" key={i.symbol} role="listitem">
          <span className="ticker__s">{i.symbol}</span>
          <span className={`ticker__v ${i.dir > 0 ? "up" : i.dir < 0 ? "down" : ""}`}>{i.value}</span>
        </div>
      ))}
    </div>
  );
}
