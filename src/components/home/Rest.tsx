import { Link } from "wouter";
import { REST, thumb } from "@/data/site";
import { ArrowRight } from "@/components/ui/Icons";
import { Frame } from "@/components/ui/Frame";

const WORDS: Record<number, string> = { 18: "Eighteen", 20: "Twenty", 16: "Sixteen" };

function Row({ items, rev }: { items: string[]; rev?: boolean }) {
  // two identical halves so the loop is seamless
  const loop = [...items, ...items];
  return (
    <div className={`marquee__track${rev ? " marquee__track--rev" : ""}`}>
      {loop.map((src, i) => (
        <div className="tile" key={`${src}-${i}`} aria-hidden={i >= items.length}>
          <Frame src={thumb(src)} alt={i < items.length ? "A Ruxxell room" : ""} eager />
        </div>
      ))}
    </div>
  );
}

export default function Rest() {
  const half = Math.ceil(REST.length / 2);
  const a = REST.slice(0, half);
  const b = REST.slice(half);

  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="rest__head">
        <span className="tag">The rest of it</span>
        <h2 className="display h-lg">{WORDS[REST.length] ?? REST.length} more</h2>
        <p className="lede">Rooms that didn’t make the descent. Nobody has explained the dragon yet.</p>
        <Link href="/gallery" className="btn btn--ghost btn--sm" style={{ height: 60, padding: "0 26px" }}>
          See all of them <ArrowRight size={14} />
        </Link>
      </div>

      <div className="marquee" aria-label="More Ruxxell rooms">
        <Row items={a} />
        <Row items={b} rev />
      </div>
    </section>
  );
}
