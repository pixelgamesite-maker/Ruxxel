import type { ReactNode } from "react";
import { CheckPx } from "@/components/ui/Icons";

export default function Step({
  n,
  title,
  hint,
  done,
  locked,
  children,
}: {
  n: number;
  title: string;
  hint: string;
  done: boolean;
  locked: boolean;
  children: ReactNode;
}) {
  const state = done ? "done" : locked ? "locked" : "active";
  return (
    <section className="step" data-state={state} aria-disabled={locked}>
      <div className="step__top">
        <span className="step__no">{done ? <CheckPx size={18} /> : n}</span>
        <div>
          <h3 className="step__t">{title}</h3>
          <p className="step__h">{hint}</p>
        </div>
      </div>
      {!locked && !done && <div className="step__body">{children}</div>}
    </section>
  );
}
