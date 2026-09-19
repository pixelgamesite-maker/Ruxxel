import { Link, useLocation } from "wouter";
import { Mark } from "@/components/ui/Kit";

const TITLES: Record<string, [string, string]> = {
  "/": ["Ruxxells", "1,970 on Robinhood Chain"],
  "/lab": ["The Lab", "Where the crew works"],
  "/crew": ["The Crew", "Five jobs, one collection"],
  "/mint": ["Mint", "Access list is open"],
  "/peek": ["Sneak peek", "Straight from the lab"],
};

export default function AppBar() {
  const [path] = useLocation();
  const [title, sub] = TITLES[path] ?? ["Ruxxells", "Onchain research crew"];

  return (
    <header className="appbar">
      <div className="appbar__in">
        <Link href="/" className="logo" aria-label="Ruxxells home">
          <Mark size={26} />
        </Link>
        <div>
          <div className="appbar__t">{title}</div>
          <span className="appbar__s mono">{sub}</span>
        </div>
        <Link href="/mint" className="join">
          JOIN
        </Link>
      </div>
    </header>
  );
}
