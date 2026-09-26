import { useEffect, useRef, useState, type ReactNode } from "react";
import { LOGO_CANDIDATES } from "@/data/site";

/* ------------------------------------------------------------------ mark -- */

/** Stacked isometric tiles — the worlds, seen from above. */
export function Mark({ size = 26, color = "var(--green)" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M14 3 25 9 14 15 3 9 14 3Z" fill={color} />
      <path d="M4.6 13 14 18.2 23.4 13 25 14 14 20.4 3 14l1.6-1Z" fill={color} opacity="0.62" />
      <path d="M4.6 18.6 14 23.8 23.4 18.6 25 19.6 14 26 3 19.6l1.6-1Z" fill={color} opacity="0.32" />
    </svg>
  );
}

/** Brand tile. Tries each logo filename in turn, falls back to the drawn mark. */
export function Logo({ size = 32, radius = 9 }: { size?: number; radius?: number }) {
  const [attempt, setAttempt] = useState(0);
  const src = LOGO_CANDIDATES[attempt];

  return (
    <span className="logo" style={{ width: size, height: size, borderRadius: radius }}>
      {src ? (
        <img src={src} alt="" onError={() => setAttempt((a) => a + 1)} />
      ) : (
        <Mark size={Math.round(size * 0.54)} />
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

/* ----------------------------------------------------------------- media -- */

const isVideo = (src: string) => /\.(mp4|webm|mov)$/i.test(src);

/** Art gets re-exported constantly, so try the usual extensions before giving up. */
const EXTS = ["jpeg", "jpg", "png", "webp", "gif"];

function candidates(src: string): string[] {
  if (isVideo(src)) return [src];
  const stem = src.replace(/\.[a-z0-9]+$/i, "");
  const current = (src.match(/\.([a-z0-9]+)$/i)?.[1] ?? "").toLowerCase();
  return [src, ...EXTS.filter((e) => e !== current).map((e) => `${stem}.${e}`)];
}

/** Square art slot. Handles stills and mp4 loops, shows a labelled tile if absent. */
export function Pixel({ src, alt, label }: { src: string; alt: string; label?: string }) {
  const tries = candidates(src);
  const [attempt, setAttempt] = useState(0);
  const current = tries[attempt];

  if (!current) {
    return (
      <div className="pix pix--ph" role="img" aria-label={alt}>
        {label ?? src.replace("/", "")}
      </div>
    );
  }

  return (
    <div className="pix">
      {isVideo(current) ? (
        <video
          src={current}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={alt}
          onError={() => setAttempt((a) => a + 1)}
        />
      ) : (
        <img key={current} src={current} alt={alt} loading="lazy" onError={() => setAttempt((a) => a + 1)} />
      )}
    </div>
  );
}

/** Bare media element for custom frames (hero stack, mining rig). */
export function Media({ src, alt }: { src: string; alt: string }) {
  const tries = candidates(src);
  const [attempt, setAttempt] = useState(0);
  const current = tries[attempt];

  if (!current) {
    return <div className="pix pix--ph" style={{ height: "100%", borderRadius: 0, border: 0 }}>{src.replace("/", "")}</div>;
  }

  return isVideo(current) ? (
    <video src={current} autoPlay muted loop playsInline preload="metadata" onError={() => setAttempt((a) => a + 1)} />
  ) : (
    <img key={current} src={current} alt={alt} loading="lazy" onError={() => setAttempt((a) => a + 1)} />
  );
}

/* ------------------------------------------------------------------ misc -- */

/** Reveals children once they scroll into view. One orchestrated entrance each. */
export function Rise({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSeen(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`rise ${className}`.trim()}
      data-in={seen ? 1 : 0}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function Head({
  eyebrow,
  title,
  body,
  center = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  body?: string;
  center?: boolean;
}) {
  return (
    <div className={`head ${center ? "head--center" : ""}`.trim()}>
      {eyebrow && <span className="mono">{eyebrow}</span>}
      <h2>{title}</h2>
      {body && <p>{body}</p>}
    </div>
  );
}

/** Counts a number up smoothly whenever the target changes. */
export function useCountUp(target: number, ms = 700) {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  const raf = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    const start = performance.now();
    const origin = from.current;
    const delta = target - origin;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(origin + delta * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else from.current = target;
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, ms]);

  return value;
}
