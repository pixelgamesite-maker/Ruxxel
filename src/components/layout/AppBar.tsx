import { Link, useLocation } from "wouter";
import { BRAND, LOGO, NAV, SHOW_CLAIM_IN_NAV } from "@/data/site";

export default function AppBar() {
  const [path] = useLocation();
  const items = SHOW_CLAIM_IN_NAV
    ? [{ href: "/claim", label: "Claim", primary: false }, ...NAV]
    : NAV;

  return (
    <header className="appbar">
      <div className="appbar__in">
        <Link href="/" className="brand" aria-label={`${BRAND.name} home`}>
          <img className="brand__logo" src={LOGO} alt="" width={58} height={58} />
          <span className="brand__n">{BRAND.name}</span>
        </Link>

        <nav className="nav" aria-label="Primary">
          {items.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={n.primary ? "is-primary" : undefined}
              aria-current={path === n.href ? "page" : undefined}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
