import { Link } from "wouter";
import { COLLECTION } from "@/data/site";
import { ArrowRight } from "@/components/ui/Icons";
import { useAccessCount } from "@/lib/useAccessCount";

export default function Gate() {
  const count = useAccessCount();

  return (
    <section className="gate inset">
      <span className="tag gate__tag">
        Minting on Robinhood<i>·</i>
        <em>{COLLECTION.mintStatus}</em>
      </span>

      <h2 className="display h-xl">The gate is open</h2>

      <div className="gate__cta">
        <Link href="/checkpoint" className="btn btn--lime">
          Get cleared <ArrowRight />
        </Link>
        <Link href="/gallery" className="btn btn--ghost">
          The collection
        </Link>
      </div>

      <dl className="stats">
        <div className="stat">
          <dt>Chain</dt>
          <dd>Robinhood</dd>
        </div>
        <div className="stat">
          <dt>Price</dt>
          <dd>{COLLECTION.mintPrice}</dd>
        </div>
        <div className="stat">
          <dt>Supply</dt>
          <dd>{COLLECTION.supplyLabel}</dd>
        </div>
        <div className="stat">
          <dt>In</dt>
          <dd>{count === null ? "—" : count.toLocaleString("en-US")}</dd>
        </div>
      </dl>
    </section>
  );
}
