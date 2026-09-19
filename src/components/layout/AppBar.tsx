import { Link, useLocation } from "wouter";
import { BRAND, COLLECTION } from "@/data/site";
import { Logo } from "@/components/ui/Kit";

const NAV = [
  { href: "/lab", label: "Lab" },
  { href: "/crew", label: "Crew" },
  { href: "/peek", label: "Gallery" },
];

export default function AppBar() {
  const [path] = useLocation();

  return (
    <header className="appbar">
      <div className="appbar__in">
        <Link href="/" className="brand" aria-label="Ruxxells home">
          <Logo />
          <span>
            <span className="brand__n">{BRAND.name}</span>
            <span className="brand__s mono">
              {COLLECTION.supplyLabel} · {COLLECTION.chain}
            </span>
          </span>
        </Link>

        <nav className="nav" aria-label="Primary">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={path === n.href ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>

        <Link href="/mint" className="join">
          Join
        </Link>
      </div>
    </header>
  );
}
