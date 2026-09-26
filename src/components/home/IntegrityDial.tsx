import { useState } from "react";
import { STAGES } from "@/data/utility";
import { useCountUp } from "@/components/ui/Kit";

/**
 * Reconstruction dial. Spend Fragments, watch World Integrity climb and the
 * evolution stage change underneath it.
 */

const R = 86;
const CIRC = 2 * Math.PI * R;

export default function IntegrityDial() {
  const [integrity, setIntegrity] = useState(20);
  const shown = useCountUp(integrity, 650);

  const stage = [...STAGES].reverse().find((s) => integrity >= s.at) ?? STAGES[0];
  const offset = CIRC - (integrity / 100) * CIRC;

  return (
    <div className="forge">
      <div>
        <div className="dial">
          <svg viewBox="0 0 200 200" role="img" aria-label={`World Integrity ${integrity} percent`}>
            <defs>
              <linearGradient id="dialGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2bff86" />
                <stop offset="55%" stopColor="#4fe3ff" />
                <stop offset="100%" stopColor="#a97bff" />
              </linearGradient>
            </defs>
            <circle className="dial__track" cx="100" cy="100" r={R} />
            <circle
              className="dial__fill"
              cx="100"
              cy="100"
              r={R}
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="dial__c">
            <b>{Math.round(shown)}%</b>
            <span>World Integrity</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
          <button
            className="btn btn--sm btn--ghost"
            onClick={() => setIntegrity((v) => Math.max(0, v - 20))}
            disabled={integrity === 0}
          >
            Reset
          </button>
          <button
            className="btn btn--sm"
            onClick={() => setIntegrity((v) => Math.min(100, v + 20))}
            disabled={integrity === 100}
          >
            {integrity === 100 ? "Fully rebuilt" : "Spend Fragments"}
          </button>
        </div>

        <p className="note" style={{ textAlign: "center", marginTop: 14 }}>
          Currently <b style={{ color: "var(--green)" }}>{stage.k}</b>
        </p>
      </div>

      <div className="stages">
        {STAGES.map((s) => (
          <div className="stage" key={s.k} data-on={integrity >= s.at ? 1 : 0}>
            <span className="stage__d" aria-hidden="true" />
            <div>
              <b>
                {s.k} <span className="note">· {s.at}%</span>
              </b>
              <p>{s.d}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
