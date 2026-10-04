import { Link, useLocation } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
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

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {items.length > 0 && (
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
          )}

          <ConnectButton
            showBalance={{ smallScreen: false, largeScreen: true }}
            accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
            chainStatus={{ smallScreen: "icon", largeScreen: "full" }}
          />
        </div>
      </div>
    </header>
  );
}
