import { Link } from "wouter";
import { ArrowRight } from "@/components/ui/Icons";

export default function NotFound() {
  return (
    <section className="inset">
      <div className="page-head">
        <span className="tag">404</span>
        <h1 className="display h-lg">Nothing here</h1>
        <p className="lede">That room does not exist, or it has not been dug out yet.</p>
        <Link href="/" className="btn btn--lime" style={{ marginTop: 40 }}>
          Back to the gate <ArrowRight />
        </Link>
      </div>
    </section>
  );
}
