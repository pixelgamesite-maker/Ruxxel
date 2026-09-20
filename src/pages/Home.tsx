import { Link } from "wouter";
import { BRAND, COLLECTION, DISCLAIMER, MOTION, PIXELS, ROADMAP, STEPS } from "@/data/site";
import { CREW } from "@/data/crew";
import { ASSETS } from "@/data/assets";
import { usePrices } from "@/lib/prices";
import { pct, price } from "@/lib/format";
import { Pixel, Section, Ticker, XIcon } from "@/components/ui/Kit";
import MiningCards from "@/components/home/MiningCards";

export default function Home() {
  const { quotes, live } = usePrices();
  const ticker = ASSETS.slice(0, 6).map((a) => {
    const q = quotes[a.symbol] ?? { price: a.price, change24h: a.change24h };
    return { symbol: a.symbol, value: `${price(q.price)}  ${pct(q.change24h)}`, dir: q.change24h };
  });

  return (
    <>
      <section className="block">
        <span className="mono">Genesis · {COLLECTION.chain}</span>
        <h1>
          Your research crew
          <br />
          for the <em>onchain economy</em>.
        </h1>
        <p>
          {COLLECTION.supplyLabel} pixel researchers reading tokenized stocks, treasuries, gold and
          funds around the clock, then telling you what moved and why in plain words.
        </p>

        <div className="block__cta">
          <Link href="/mint" className="btn">
            Join the access list
          </Link>
          <Link href="/lab" className="btn btn--ghost">
            Open the lab
          </Link>
        </div>

        <div className="block__art">
          <Pixel src={MOTION[0]} alt="Inside the lab" label="ruxxells1.mp4" />
          <Pixel src={PIXELS[0]} alt="A Ruxxell" label="#1" />
        </div>
      </section>

      <Ticker items={ticker} live={live} />

      <div className="stats" style={{ marginTop: 16 }}>
        <div className="stat">
          <b>{COLLECTION.supplyLabel}</b>
          <span>Supply</span>
        </div>
        <div className="stat">
          <b>{COLLECTION.mintPrice}</b>
          <span>Mint price</span>
        </div>
        <a className="stat stat--link" href={BRAND.launchpad} target="_blank" rel="noopener noreferrer">
          <b>OpenSea</b>
          <span>Launchpad</span>
        </a>
      </div>

      <Section title="Join a crew to start mining" meta="Live rates">
        <MiningCards />
      </Section>

      <Section title="The crew" meta={`${CREW.length} roles`} band>
        <div className="hscroll hscroll--sm">
          {CREW.map((m) => (
            <Link key={m.id} href="/crew" style={{ display: "grid", gap: 10, alignContent: "start" }}>
              <Pixel src={m.img} alt={m.name} label={m.role} />
              <span>
                <span className="tag" data-tone={m.tone}>
                  {m.role}
                </span>
                <b style={{ display: "block", fontSize: "0.9rem", fontWeight: 500 }}>{m.name}</b>
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="How it works" meta="Four moves" band>
        {STEPS.map((s, i) => (
          <div className="strip-row" key={s.k}>
            <span className="step__n">{i + 1}</span>
            <span>
              <b style={{ display: "block", fontSize: "0.96rem", fontWeight: 500 }}>{s.k}</b>
              <span style={{ color: "var(--faint)", fontSize: "0.85rem" }}>{s.d}</span>
            </span>
          </div>
        ))}
      </Section>

      <Section title="The plan" meta="Roadmap">
        <div className="timeline">
          {ROADMAP.map((p) => (
            <div className="phase" key={p.t}>
              <span className="mono" style={{ color: "var(--green)" }}>
                {p.k}
              </span>
              <b>{p.t}</b>
              <p>{p.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <section className="block" style={{ marginTop: 46 }}>
        <span className="mono">Access list open</span>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
          {COLLECTION.supplyLabel} passes.
          <br />
          One per wallet.
        </h1>
        <p>Four steps, reviewed by hand. Mint price and date land first on {BRAND.handle}.</p>
        <div className="block__cta">
          <Link href="/mint" className="btn">
            Apply now
          </Link>
          <a className="btn btn--ghost" href={BRAND.x} target="_blank" rel="noopener noreferrer">
            <XIcon /> Follow
          </a>
        </div>
      </section>

      <p className="disclaimer">{DISCLAIMER}</p>
    </>
  );
}
