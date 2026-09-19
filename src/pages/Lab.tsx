import { useState } from "react";
import { ASSETS, type Asset } from "@/data/assets";
import { LAB_CARDS } from "@/data/site";
import AssetList from "@/components/lab/AssetList";
import AssetDetail from "@/components/lab/AssetDetail";
import CompareView from "@/components/lab/CompareView";
import PortfolioView from "@/components/lab/PortfolioView";
import AlertBuilder from "@/components/alerts/AlertBuilder";

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
