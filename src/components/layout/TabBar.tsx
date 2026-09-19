import { Link, useLocation } from "wouter";

const ICONS: Record<string, JSX.Element> = {
  home: (
    <path d="M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5" />
  ),
  lab: (
    <path d="M9.5 3v6.2L4.8 17.4A2 2 0 0 0 6.5 20.5h11a2 2 0 0 0 1.7-3.1L14.5 9.2V3M8 3h8M7.4 14.5h9.2" />
  ),
  crew: (
    <path d="M9 11a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 11ZM3 20c0-3.1 2.7-5.2 6-5.2S15 16.9 15 20M16.5 5.2a3 3 0 0 1 0 5.8M17 14.9c2.4.5 4 2.3 4 5.1" />
  ),
  mint: (
    <path d="M12 3.2 14.6 8l5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.4 8.8 9.8 8 12 3.2Z" />
  ),
  peek: (
    <path d="M4 4.8h6.2V11H4zM13.8 4.8H20V11h-6.2zM4 13h6.2v6.2H4zM13.8 13H20v6.2h-6.2z" />
  ),
};

const TABS = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/lab", label: "Lab", icon: "lab" },
  { href: "/crew", label: "Crew", icon: "crew" },
  { href: "/mint", label: "Mint", icon: "mint" },
  { href: "/peek", label: "Peek", icon: "peek" },
];

export default function TabBar() {
  const [path] = useLocation();

  return (
    <nav className="tabs" aria-label="Primary">
      {TABS.map((t) => {
        const on = path === t.href;
        return (
          <Link key={t.href} href={t.href} className="tab" data-on={on ? 1 : 0} aria-current={on ? "page" : undefined}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {ICONS[t.icon]}
            </svg>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
