import { useEffect, useRef } from "react";

/**
 * Background pixel ripple. One eased ring of small squares per press,
 * dissolving into grain. Restrained on purpose — the surface reacting,
 * not confetti.
 */

type Ring = { x: number; y: number; born: number; tint: [number, number, number] };

const CELL = 9;
const GAP = 1;
const LIFE = 900;
const REACH = 260;
const BAND = 26;

const TINTS: [number, number, number][] = [
  [43, 255, 134],
  [79, 227, 255],
  [169, 123, 255],
];

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export default function PixelRipple() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = el.getContext("2d");
    if (!context) return;

    const canvas: HTMLCanvasElement = el;
    const ctx: CanvasRenderingContext2D = context;

    let rings: Ring[] = [];
    let raf = 0;
    let index = 0;

    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function add(x: number, y: number) {
      rings.push({ x, y, born: performance.now(), tint: TINTS[index++ % TINTS.length] });
      if (rings.length > 4) rings.shift();
      if (!raf) raf = requestAnimationFrame(draw);
    }

    function draw(now: number) {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      rings = rings.filter((r) => now - r.born < LIFE);

      for (const ring of rings) {
        const t = (now - ring.born) / LIFE;
        const radius = easeOut(t) * REACH;
        const fade = Math.pow(1 - t, 1.8);
        const [r, g, b] = ring.tint;

        const reach = Math.ceil((radius + BAND) / CELL) * CELL;
        const left = Math.max(-reach, -ring.x - CELL);
        const right = Math.min(reach, window.innerWidth - ring.x + CELL);
        const top = Math.max(-reach, -ring.y - CELL);
        const bottom = Math.min(reach, window.innerHeight - ring.y + CELL);

        for (let dx = left; dx <= right; dx += CELL) {
          for (let dy = top; dy <= bottom; dy += CELL) {
            const dist = Math.hypot(dx, dy);
            const edge = Math.abs(dist - radius);
            if (edge > BAND) continue;

            const falloff = Math.pow(1 - edge / BAND, 2);
            const grain = 0.65 + Math.random() * 0.35;
            const alpha = falloff * fade * grain * 0.3;
            if (alpha < 0.012) continue;

            const px = Math.floor((ring.x + dx) / CELL) * CELL;
            const py = Math.floor((ring.y + dy) / CELL) * CELL;

            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
            ctx.fillRect(px, py, CELL - GAP, CELL - GAP);
          }
        }

        if (t < 0.28) {
          const core = (1 - t / 0.28) * 0.5;
          const cx = Math.floor(ring.x / CELL) * CELL;
          const cy = Math.floor(ring.y / CELL) * CELL;
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${core.toFixed(3)})`;
          ctx.fillRect(cx, cy, CELL - GAP, CELL - GAP);
        }
      }

      raf = rings.length ? requestAnimationFrame(draw) : 0;
    }

    const onPointer = (e: PointerEvent) => add(e.clientX, e.clientY);

    size();
    window.addEventListener("resize", size);
    window.addEventListener("pointerdown", onPointer);

    return () => {
      window.removeEventListener("resize", size);
      window.removeEventListener("pointerdown", onPointer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={ref} className="ripple" aria-hidden="true" />;
}
