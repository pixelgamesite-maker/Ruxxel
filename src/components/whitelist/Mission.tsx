import type { ReactNode } from "react";

export default function Mission({
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
  return (
    <section className="step" data-done={done ? 1 : 0} data-locked={locked ? 1 : 0}>
      <div className="step__h">
        <span className="step__n" aria-hidden="true">
          {done ? "✓" : n}
        </span>
        <div>
          <div className="step__t">{title}</div>
          <div className="step__d">{done ? "Done" : locked ? "Finish the step above" : hint}</div>
        </div>
      </div>
      {!locked && !done && <div className="step__b">{children}</div>}
    </section>
  );
}
