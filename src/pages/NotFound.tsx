import { Link } from "wouter";
import { Mark } from "@/components/ui/Kit";

export default function NotFound() {
  return (
    <div className="nf">
      <Mark size={44} />
      <h1 style={{ fontSize: "clamp(1.8rem, 6vw, 2.6rem)", margin: "22px 0 12px" }}>
        No world at this address.
      </h1>
      <p className="note" style={{ marginBottom: 26 }}>
        Nothing has been excavated here yet.
      </p>
      <Link href="/" className="btn">
        Back to the surface
      </Link>
    </div>
  );
}
