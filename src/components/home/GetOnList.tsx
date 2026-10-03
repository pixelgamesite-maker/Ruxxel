import { Link } from "wouter";
import { COLLECTION } from "@/data/site";
import { ArrowRight, Eyes } from "@/components/ui/Icons";

export default function GetOnList() {
  return (
    <section className="section" style={{ paddingBottom: 0 }}>
      <div className="col cta">
        <Eyes size={14} />
        <h2 className="display h-cta">Get on the list</h2>
        <p className="lede">
          Four steps, then your wallet. Price {COLLECTION.mintPrice}, supply {COLLECTION.supplyLabel}.
        </p>
        <Link href="/checkpoint" className="btn btn--lime">
          Start <ArrowRight />
        </Link>
      </div>
    </section>
  );
}
