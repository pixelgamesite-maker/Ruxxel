import { HERO_IMG } from "@/data/site";

export default function Hero() {
  return (
    <section className="wrap" aria-label="Ruxxells">
      <div className="hero__stage scan">
        <img src={HERO_IMG} alt="" fetchPriority="high" />
        <div className="hero__shade" />
        <h1 className="display display--lime hero__logo">
          <span>Ruxxells</span>
        </h1>
      </div>
    </section>
  );
}
