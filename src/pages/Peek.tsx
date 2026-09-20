import { MOTION, PIXELS } from "@/data/site";
import { Pixel, Section } from "@/components/ui/Kit";

export default function Peek() {
  return (
    <>
      <div className="block">
        <h1>Straight from the lab.</h1>
        <span className="mono">Unrevealed</span>
        <p>Worlds, roles and traits from the genesis collection. No filters, no upscaling.</p>
        <div className={`block__art ${MOTION.length === 1 ? "block__art--one" : ""}`.trim()}>
          {MOTION.map((src, i) => (
            <Pixel key={src} src={src} alt={`Lab clip ${i + 1}`} label={`ruxxells${i + 1}.mp4`} />
          ))}
        </div>
      </div>

      <Section title="The gallery" meta={`${PIXELS.length} pieces`}>
        <div className="grid-pix">
          {PIXELS.map((src, i) => (
            <Pixel key={src} src={src} alt={`Ruxxell ${i + 1}`} label={`#${i + 1}`} />
          ))}
        </div>
      </Section>
    </>
  );
}
