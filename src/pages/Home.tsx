import { useState } from "react";
import { Link } from "wouter";
import { BRAND, COLLECTION, DISCLAIMER, FAQS, LAB_CARDS, MOTION, PIXELS, ROADMAP, STEPS } from "@/data/site";
import { CREW } from "@/data/crew";
import { CardArt, Pixel, Section, XIcon } from "@/components/ui/Kit";

export default function Home() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <div className="block">
        <h1>
          1,970 Ruxxells.
          <br />
          One Lab.
          <br />
          Real Research.
        </h1>
        <span className="mono">The genesis collection</span>
        <p>
          A crew of pixel researchers living on {COLLECTION.chain}. They read tokenized stocks,
          treasuries, gold and funds all day, then tell you what moved and why in plain words.
        </p>

        <div className="block__art">
          <Pixel src={MOTION[0]} alt="The lab" label="ruxxel1.gif" />
          <Pixel src={MOTION[1]} alt="The lab" label="ruxxel2.gif" />
        </div>

        <div className="block__cta">
          <Link href="/mint" className="btn-dark">
            Join the list
          </Link>
          <Link href="/lab" className="btn-out">
            Open the lab
          </Link>
        </div>
      </div>

      <div className="strip-row" style={{ marginTop: 14 }}>
        <span className="logo" style={{ width: 34, height: 34, borderRadius: 11 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#06210f" aria-hidden="true">
            <path d="M12 2c1.6 4.5 4.6 7.2 9 8.4-4.4 1.3-7.4 4-9 8.4-1.6-4.4-4.6-7.1-9-8.4 4.4-1.2 7.4-3.9 9-8.4Z" />
          </svg>
        </span>
        <span>
          <b style={{ display: "block", fontSize: "0.95rem" }}>{COLLECTION.chain}</b>
          <span className="mono" style={{ color: "var(--faint)" }}>
            {COLLECTION.status}
          </span>
        </span>
      </div>

      <div className="stats">
        <div className="stat">
          <b>{COLLECTION.supplyLabel}</b>
          <span>Supply</span>
        </div>
        <div className="stat">
          <b>{COLLECTION.mintPrice}</b>
          <span>Mint price</span>
        </div>
        <div className="stat">
          <b>{CREW.length}</b>
          <span>Roles</span>
        </div>
      </div>

      <Section title="The Lab" meta="Try it now">
        <div className="hscroll">
          {LAB_CARDS.map((c) => (
            <Link key={c.id} href="/lab" className="card" data-tone={c.tone}>
              <CardArt src={c.art} alt={c.name} pill={c.status} />
              <div className="card__body">
                <h3>{c.name}</h3>
                <p>{c.blurb}</p>
                <span className="card__link">Open in the lab</span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Meet the crew" meta={`${CREW.length} roles`}>
        <div className="hscroll hscroll--sm">
          {CREW.map((m) => (
            <Link key={m.id} href="/crew" style={{ display: "grid", gap: 8, alignContent: "start" }}>
              <Pixel src={m.img} alt={m.name} label={m.role} />
              <span>
                <span className="tag" data-tone={m.tone}>
                  {m.role}
                </span>
                <b style={{ display: "block", fontSize: "0.88rem" }}>{m.name}</b>
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="How it works" meta="Four moves">
        {STEPS.map((s, i) => (
          <div className="strip-row" key={s.k}>
            <span className="step__n">{i + 1}</span>
            <span>
              <b style={{ display: "block", fontSize: "0.95rem" }}>{s.k}</b>
              <span style={{ color: "var(--faint)", fontSize: "0.84rem" }}>{s.d}</span>
            </span>
          </div>
        ))}
      </Section>

      <Section title="Sneak peek" meta="See all">
        <div className="hscroll hscroll--sm">
          {PIXELS.slice(0, 10).map((src, i) => (
            <Link key={src} href="/peek">
              <Pixel src={src} alt={`Ruxxell ${i + 1}`} label={`#${i + 1}`} />
            </Link>
          ))}
        </div>
      </Section>

      <Section title="What is coming" meta="Roadmap">
        <div className="timeline">
          {ROADMAP.map((p) => (
            <div className="phase" key={p.t}>
              <span className="mono" style={{ color: "var(--rh)" }}>
                {p.k}
              </span>
              <b>{p.t}</b>
              <p>{p.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Questions" meta={`${FAQS.length} answers`}>
        <div className="faq">
          {FAQS.map((f, i) => (
            <div className="faq__i" key={f.q}>
              <button className="faq__q" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                {f.q}
                <span style={{ color: "var(--rh)" }}>{open === i ? "−" : "+"}</span>
              </button>
              {open === i && <p className="faq__a">{f.a}</p>}
            </div>
          ))}
        </div>
      </Section>

      <div style={{ padding: "22px 16px 0", display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href="/mint" className="btn">
          Join the access list
        </Link>
        <a
          className="btn btn--ghost"
          href={BRAND.x}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <XIcon /> {BRAND.handle}
        </a>
      </div>

      <p className="disclaimer">{DISCLAIMER}</p>
    </>
  );
}
