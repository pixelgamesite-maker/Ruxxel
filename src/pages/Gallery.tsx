import { useCallback, useEffect, useMemo, useState } from "react";
import { REST, SECTORS, thumb } from "@/data/site";
import { Frame } from "@/components/ui/Frame";

type Room = { src: string; label: string };

/** Sector rooms first, then everything else. */
const ROOMS: Room[] = [
  ...SECTORS.map((s) => ({ src: s.img, label: s.name })),
  ...REST.map((src, i) => ({ src, label: `Room ${i + 1}` })),
];

export default function Gallery() {
  // Art that has not been supplied yet is dropped from the grid, not shown as a hole.
  const [missing, setMissing] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<string | null>(null);

  const rooms = useMemo(() => ROOMS.filter((r) => !missing.has(r.src)), [missing]);
  const markMissing = useCallback(
    (src: string) => setMissing((m) => (m.has(src) ? m : new Set(m).add(src))),
    [],
  );

  const index = open === null ? -1 : rooms.findIndex((r) => r.src === open);
  const current = index >= 0 ? rooms[index] : null;

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen(rooms[(index + 1) % rooms.length].src);
      if (e.key === "ArrowLeft") setOpen(rooms[(index - 1 + rooms.length) % rooms.length].src);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, index, rooms]);

  return (
    <section className="inset">
      <div className="page-head">
        <span className="tag">The collection</span>
        <h1 className="display h-lg">Every room</h1>
        <p className="lede">Every Ruxxell comes out of one of these. Tap a room to look closer.</p>
      </div>

      <div className="gal">
        {rooms.map((r) => (
          <button key={r.src} className="gal__item" onClick={() => setOpen(r.src)} aria-label={`Open ${r.label}`}>
            <Frame src={thumb(r.src)} alt={r.label} onMissing={() => markMissing(r.src)} />
          </button>
        ))}
      </div>

      {current && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={current.label} onClick={() => setOpen(null)}>
          <div className="lightbox__in" onClick={(e) => e.stopPropagation()}>
            <Frame src={current.src} alt={current.label} eager />
            <div className="lightbox__bar">
              <span className="tag">{current.label}</span>
              <button className="btn btn--ghost btn--sm" onClick={() => setOpen(null)} autoFocus>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
