import { Link } from "wouter";
import { BRAND, COLLECTION } from "@/data/site";
import { claimMode } from "@/lib/claim";
import ClaimPanel from "@/components/claim/ClaimPanel";
import { ArrowRight } from "@/components/ui/Icons";

export default function Claim() {
  return (
    <section className="inset">
      <div className="page-head" style={{ textAlign: "center" }}>
        <span className="tag">Free claim</span>
        <h1 className="display h-lg">Claim your Ruxxell</h1>
      </div>

      {claimMode === "off" ? (
        <div className="claim">
          <div className="claim__panel">
            <h2 className="display h-lg claim__title">Opens with the mint</h2>
            <p className="claim__sub">
              FREE claiming opens at the same time as the public mint, for {"30"} minutes. Price{" "}
              {COLLECTION.mintPrice}. The date is announced on {BRAND.handle} first.
            </p>
            <Link href="/checkpoint" className="btn btn--lime">
              Get cleared <ArrowRight />
            </Link>
          </div>
        </div>
      ) : (
        <ClaimPanel />
      )}
    </section>
  );
}
