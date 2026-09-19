import { useMemo, useState } from "react";
import { ASSETS, CLASSES, type Asset, type AssetClass } from "@/data/assets";
import { dirClass, pct, price } from "@/lib/format";

export default function AssetList({
  selected,
  onSelect,
}: {
  selected: Asset;
  onSelect: (a: Asset) => void;
}) {
  const [q, setQ] = useState("");
  const [cls, setCls] = useState<AssetClass | "All">("All");

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ASSETS.filter((a) => {
      const okClass = cls === "All" || a.cls === cls;
      const okText =
        !needle ||
        a.symbol.toLowerCase().includes(needle) ||
        a.name.toLowerCase().includes(needle) ||
        a.sector.toLowerCase().includes(needle);
      return okClass && okText;
    });
  }, [q, cls]);

  return (
    <div>
      <input
        className="search"
        placeholder="Search AAPLx, gold, treasury..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search assets"
      />

      <div className="seg">
        {(["All", ...CLASSES] as const).map((c) => (
          <button key={c} data-on={cls === c ? 1 : 0} onClick={() => setCls(c)} aria-pressed={cls === c}>
            {c}
          </button>
        ))}
      </div>

      <div className="rows">
        {results.map((a) => (
          <button
            key={a.symbol}
            className="row"
            data-sel={a.symbol === selected.symbol ? 1 : 0}
            onClick={() => onSelect(a)}
          >
            <span>
              <span className="row__sym">{a.symbol}</span>
              <span className="row__name">{a.name}</span>
            </span>
            <span>
              <span className="row__px">{price(a.price)}</span>
              <span className={`row__ch ${dirClass(a.change24h)}`}>{pct(a.change24h)}</span>
            </span>
          </button>
        ))}
        {results.length === 0 && (
          <p className="note" style={{ textAlign: "center", padding: "22px 0" }}>
            Nothing matches that. Try a symbol, a company or a sector.
          </p>
        )}
      </div>
    </div>
  );
}
