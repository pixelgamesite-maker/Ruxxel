import { useEffect, useRef } from "react";

/**
 * Background pixel ripple. Every tap or click sends a ring of chunky blocks
 * outward on a full-screen canvas sitting behind the page content.
 * Pointer events pass straight through, and it switches itself off for anyone
 * who asked for reduced motion.
 */

type Ring = { x: number; y: number; born: number; hue: string };

const CELL = 14; // block size in px — the chunkier this is, the more retro
const LIFE = 1100; // ms a ring lives
const MAX_R = 320; // px the ring travels
const HUES = ["#22ff7e", "#4fe3ff", "#ff4fd8", "#ffd84f", "#a97bff"];

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

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let rings: Ring[] = [];
    let raf = 0;

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function add(x: number, y: number) {
      rings.push({ x, y, born: performance.now(), hue: HUES[Math.floor(Math.random() * HUES.length)] });
      if (rings.length > 6) rings.shift();
      if (!raf) raf = requestAnimationFrame(draw);
    }

    function draw(now: number) {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      rings = rings.filter((r) => now - r.born < LIFE);

      for (const ring of rings) {
        const t = (now - ring.born) / LIFE; // 0 -> 1
        const radius = t * MAX_R;
        const fade = 1 - t;
        const band = CELL * 2.2;

        // walk the bounding box in cell steps, light the cells near the radius
        const reach = Math.ceil((radius + band) / CELL) * CELL;
        for (let dx = -reach; dx <= reach; dx += CELL) {
          for (let dy = -reach; dy <= reach; dy += CELL) {
            const dist = Math.hypot(dx, dy);
            const edge = Math.abs(dist - radius);
            if (edge > band) continue;

            const px = Math.floor((ring.x + dx) / CELL) * CELL;
            const py = Math.floor((ring.y + dy) / CELL) * CELL;
            if (px < -CELL || py < -CELL || px > window.innerWidth || py > window.innerHeight) continue;

            const strength = (1 - edge / band) * fade;
            if (strength < 0.06) continue;

            ctx.globalAlpha = strength * 0.5;
            ctx.fillStyle = ring.hue;
            ctx.fillRect(px, py, CELL - 2, CELL - 2);
          }
        }
      }

      ctx.globalAlpha = 1;
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
