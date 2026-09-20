import { Link } from "wouter";
import { BRAND, COLLECTION, NAV } from "@/data/site";
import { Logo, XIcon } from "@/components/ui/Kit";

export default function Footer() {
  return (
    <footer className="ftr">
      <div className="ftr__top">
        <div className="ftr__brand">
          <Link href="/" className="brand">
            <Logo size={38} radius={11} />
            <span className="brand__n" style={{ fontSize: "1.2rem" }}>
              {BRAND.name}
            </span>
          </Link>
          <p>
            {COLLECTION.supplyLabel} pixel researchers on {COLLECTION.chain}, mining $RUX and
            reading tokenized real-world assets.
          </p>
          <a className="btn btn--sm" href={BRAND.x} target="_blank" rel="noopener noreferrer">
            <XIcon /> {BRAND.handle}
          </a>
        </div>

        <nav className="ftr__col" aria-label="Footer">
          <h4 className="mono">Explore</h4>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="ftr__end">
        <span>
          © {new Date().getFullYear()} {BRAND.name}
        </span>
      </div>
    </footer>
  );
}
