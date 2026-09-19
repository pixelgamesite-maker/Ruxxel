import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="nf">
      <h1 style={{ fontSize: "2rem", marginBottom: 12 }}>Nothing filed here.</h1>
      <p className="note" style={{ marginBottom: 22 }}>The crew checked twice. This page does not exist.</p>
      <Link href="/" className="btn">
        Back to base
      </Link>
    </div>
  );
}
