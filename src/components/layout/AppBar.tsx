import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { BRAND, NAV } from "@/data/site";
import { Logo, XIcon } from "@/components/ui/Kit";

export default function AppBar() {
  const [open, setOpen] = useState(false);
  const [path] = useLocation();

  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="appbar">
        <div className="appbar__in">
          <Link href="/" className="brand" aria-label="Ruxxells home">
            <Logo />
            <span className="brand__n">{BRAND.name}</span>
          </Link>

          <nav className="nav" aria-label="Primary">
            {NAV.filter((n) => n.href !== "/").map((n) => (
              <Link key={n.href} href={n.href} aria-current={path === n.href ? "page" : undefined}>
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="appbar__side">
            <Link href="/mint" className="join">
              Apply
            </Link>

            <button
              className="burger"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="drawer" role="dialog" aria-label="Menu">
          <nav className="drawer__nav">
            {NAV.map((n, i) => (
              <Link key={n.href} href={n.href} style={{ animationDelay: `${i * 45}ms` }}>
                <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                {n.label}
              </Link>
            ))}
          </nav>
          <a className="drawer__x" href={BRAND.x} target="_blank" rel="noopener noreferrer">
            <XIcon /> {BRAND.handle}
          </a>
        </div>
      )}
    </>
  );
}
