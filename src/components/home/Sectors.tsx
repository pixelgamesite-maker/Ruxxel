import { SECTORS } from "@/data/site";
import { Frame } from "@/components/ui/Frame";

export default function Sectors() {
  return (
    <section className="section">
      <div className="col">
        <div className="sectors__head">
          <span className="tag">The world</span>
          <h2 className="display h-lg">4 Sectors</h2>
          <p className="lede">
            Every Ruxxell comes out of one of these rooms, and the room it comes from is what it can
            do once the grid opens. None of that is live yet — holding one is what unlocks it when it
            is.
          </p>
        </div>

        <div className="sectors__grid">
          {SECTORS.map((s, i) => (
            <article className="sector" data-tone={s.tone} key={s.no}>
              <div className="sector__art scan">
                <SectorArt src={s.img} name={s.name} no={s.no} eager={i < 2} />
              </div>
              <div className="sector__body">
                <span className="sector__no">Sector {s.no}</span>
                <h3 className="sector__name">{s.name}</h3>
                <p className="sector__line">{s.line}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Edge-to-edge art inside the card, so it skips the framed look. */
function SectorArt({ src, name, no, eager }: { src: string; name: string; no: string; eager: boolean }) {
  return (
    <Frame
      src={src}
      alt={`${name}, a room in Sector ${no}`}
      placeholder={`Sector ${no} art`}
      eager={eager}
      className="frame--bare"
    />
  );
}
