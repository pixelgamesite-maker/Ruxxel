import { BRAND } from "@/data/site";
import { ArrowUpRight } from "@/components/ui/Icons";

export default function Footer() {
  return (
    <footer className="foot">
      <div className="col foot__in">
        <span className="foot__brand">{BRAND.name}</span>
        <a className="foot__x" href={BRAND.x} target="_blank" rel="noopener noreferrer">
          {BRAND.handle} <ArrowUpRight />
        </a>
      </div>
    </footer>
  );
}
