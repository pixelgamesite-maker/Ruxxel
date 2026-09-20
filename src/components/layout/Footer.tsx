import { Link } from "wouter";
import { BRAND, COLLECTION, DISCLAIMER, NAV } from "@/data/site";
import { Logo, XIcon } from "@/components/ui/Kit";

export default function Footer() {
  return (
    <footer className="ftr">
      <div className="ftr__top">
        <div className="ftr__brand">
          <Link href="/" className="brand">
            <Logo size={46} radius={14} />
            <span className="brand__n" style={{ fontSize: "1.25rem" }}>
              {BRAND.name}
            </span>
          </Link>
          <p>
            {COLLECTION.supplyLabel} pixel researchers on {COLLECTION.chain}, reading tokenized
            real-world assets so you do not have to.
          </p>
          <a className="btn btn--sm" href={BRAND.x} target="_blank" rel="noopener noreferrer">
            <XIcon /> {BRAND.handle}
          </a>
        </div>

        <div className="ftr__col">
          <h4 className="mono">Explore</h4>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
        </div>

        <div className="ftr__col">
          <h4 className="mono">Collection</h4>
          <span>
            Supply <b className="num">{COLLECTION.supplyLabel}</b>
          </span>
          <span>
            Mint <b className="num">{COLLECTION.mintPrice}</b>
          </span>
          <span>
            Chain <b className="num">{COLLECTION.chain}</b>
          </span>
          <span>
            Status <b className="num">{COLLECTION.status}</b>
          </span>
        </div>
      </div>

      <p className="disclaimer">{DISCLAIMER}</p>

      <div className="ftr__end">
        <span>© {new Date().getFullYear()} {BRAND.name}</span>
        <span>Research and education. Never financial advice.</span>
      </div>
    </footer>
  );
}
