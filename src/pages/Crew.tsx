import { Link } from "wouter";
import { CREW } from "@/data/crew";
import { COLLECTION, PIXELS } from "@/data/site";
import { Pixel, Section } from "@/components/ui/Kit";

export default function Crew() {
  return (
    <>
      <div className="block">
        <h1>Five jobs. One lab.</h1>
        <span className="mono">Roles reveal after mint</span>
        <p>
          Every Ruxxell has a job and a world it works in. The role decides what your lab watches and
          which angle your questions get answered from.
        </p>
      </div>

      <Section title="The crew" meta={`${CREW.length} roles`}>
        {CREW.map((m) => (
          <article className="crew-card" key={m.id}>
            <Pixel src={m.img} alt={m.name} label={m.role} />
            <div className="crew-card__b">
              <span className="tag" data-tone={m.tone}>
                {m.role} · {m.world}
              </span>
              <h3>{m.name}</h3>
              <p>{m.long}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                {m.reads.map((r) => (
                  <span className="chip" key={r}>
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </Section>

      <Section title="The collection" meta={COLLECTION.supplyLabel}>
        <div className="grid-pix">
          {PIXELS.slice(0, 9).map((src, i) => (
            <Pixel key={src} src={src} alt={`Ruxxell ${i + 1}`} label={`#${i + 1}`} />
          ))}
        </div>
        <div style={{ padding: "16px" }}>
          <Link href="/mint" className="btn">
            Join the access list
          </Link>
        </div>
      </Section>
    </>
  );
}
