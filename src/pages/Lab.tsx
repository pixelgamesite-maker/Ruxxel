import { useEffect, useState } from "react";
import { ASSETS, type Asset } from "@/data/assets";
import { LAB_CARDS } from "@/data/site";
import AssetList from "@/components/lab/AssetList";
import AssetDetail from "@/components/lab/AssetDetail";
import CompareView from "@/components/lab/CompareView";
import PortfolioView from "@/components/lab/PortfolioView";

export default function Lab() {
  const [tab, setTab] = useState("assets");
  const [asset, setAsset] = useState<Asset>(ASSETS[0]);
  const card = LAB_CARDS.find((c) => c.id === tab)!;

  return (
    <>
      <div className="seg" style={{ paddingTop: 16 }}>
        {LAB_CARDS.map((c) => (
          <button key={c.id} data-on={tab === c.id ? 1 : 0} onClick={() => setTab(c.id)} aria-pressed={tab === c.id}>
            {c.name}
          </button>
        ))}
      </div>

      <p className="note" style={{ padding: "0 16px 14px", display: "flex", alignItems: "center", gap: 8 }}>
        <span className="dot" /> {card.blurb}
      </p>

      {tab === "assets" && (
        <>
          <AssetList selected={asset} onSelect={setAsset} />
          <AssetDetail asset={asset} />
        </>
      )}
      {tab === "compare" && <CompareView />}
      {tab === "portfolio" && <PortfolioView />}
      {tab === "alerts" && <AlertBuilder />}
    </>
  );
}

/* --------------------------------------------------------------- alerts --
   Kept in this file on purpose: one less module for the deploy to resolve.
   -------------------------------------------------------------------------- */

type Rule = { id: string; asset: string; kind: string; threshold: string; channel: string };

const KINDS = [
  { v: "move", label: "moves more than", needs: true, unit: "%" },
  { v: "onchain", label: "does something weird onchain", needs: false, unit: "" },
  { v: "allocation", label: "shifts my allocation by", needs: true, unit: "%" },
  { v: "listing", label: "shows up for the first time", needs: false, unit: "" },
  { v: "event", label: "has a big market event", needs: false, unit: "" },
];

const CHANNELS = ["In the app", "Email", "Push"];
const STORE = "ruxxells_alerts_v1";

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `r-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const SEED: Omit<Rule, "id">[] = [
  { asset: "Any asset", kind: "move", threshold: "5", channel: "In the app" },
  { asset: "REITx", kind: "onchain", threshold: "", channel: "Push" },
];

function describe(r: Rule): string {
  const kind = KINDS.find((k) => k.v === r.kind);
  const t = kind?.needs ? ` ${r.threshold}${kind.unit}` : "";
  return `${r.asset} ${kind?.label ?? r.kind}${t}`;
}

function AlertBuilder() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [asset, setAsset] = useState("Any asset");
  const [kind, setKind] = useState("move");
  const [threshold, setThreshold] = useState("5");
  const [channel, setChannel] = useState("In the app");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      setRules(raw ? JSON.parse(raw) : SEED.map((s, i) => ({ ...s, id: `seed-${i}` })));
    } catch {
      setRules([]);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORE, JSON.stringify(rules));
  }, [rules, loaded]);

  const current = KINDS.find((k) => k.v === kind)!;

  return (
    <>
      <div className="sheet">
        <div className="sheet__sec" style={{ borderTop: 0 }}>
          <h4>
            <span>New alert</span>
            <span>Saved on this device</span>
          </h4>

          <div style={{ display: "grid", gap: 10 }}>
            <select className="input" value={asset} onChange={(e) => setAsset(e.target.value)} aria-label="Asset">
              <option>Any asset</option>
              {ASSETS.map((a) => (
                <option key={a.symbol} value={a.symbol}>
                  {a.symbol} — {a.name}
                </option>
              ))}
            </select>

            <select className="input" value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Trigger">
              {KINDS.map((k) => (
                <option key={k.v} value={k.v}>
                  {k.label}
                </option>
              ))}
            </select>

            {current.needs && (
              <input
                className="input"
                type="number"
                min="0"
                step="0.5"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                aria-label="Threshold"
              />
            )}

            <select className="input" value={channel} onChange={(e) => setChannel(e.target.value)} aria-label="Channel">
              {CHANNELS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <button
              className="btn"
              onClick={() =>
                setRules((r) => [
                  { id: newId(), asset, kind, threshold: current.needs ? threshold : "", channel },
                  ...r,
                ])
              }
            >
              Create alert
            </button>
          </div>
        </div>

        <div className="sheet__sec">
          <h4>
            <span>Watching</span>
            <span>{rules.length} active</span>
          </h4>

          {rules.length === 0 ? (
            <p className="note">Nothing set yet. Build one above and the crew starts watching.</p>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {rules.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "var(--card-2)",
                    borderRadius: 14,
                    padding: "12px 14px",
                  }}
                >
                  <span className="dot" />
                  <span style={{ flex: 1 }}>
                    <b style={{ display: "block", fontSize: "0.89rem", fontWeight: 600 }}>{describe(r)}</b>
                    <span className="mono" style={{ color: "var(--faint)" }}>
                      {r.channel}
                    </span>
                  </span>
                  <button
                    onClick={() => setRules((all) => all.filter((x) => x.id !== r.id))}
                    aria-label={`Delete alert: ${describe(r)}`}
                    style={{ background: "none", border: 0, color: "var(--faint)", cursor: "pointer", fontSize: "1.1rem" }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
