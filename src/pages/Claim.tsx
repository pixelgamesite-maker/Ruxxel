import { useClaim } from "@/components/claim/useClaim";
import { CLAIM, ROBINHOOD_CHAIN } from "@/data/chain";

function short(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function Claim() {
  const { hasWallet, address, phase, error, drop, owned, txHash, connect, claim, explorerUrl } = useClaim();

  const alreadyMinted = drop ? owned >= drop.maxPerWallet : false;

  let buttonLabel = "Connect wallet";
  let buttonDisabled = false;
  let onClick = connect;

  if (!hasWallet) {
    buttonLabel = "No wallet found";
    buttonDisabled = true;
  } else if (phase === "connecting" || phase === "loading") {
    buttonLabel = "Loading…";
    buttonDisabled = true;
  } else if (address && phase === "ready" && alreadyMinted) {
    buttonLabel = "Already claimed";
    buttonDisabled = true;
  } else if (address && (phase === "ready" || phase === "error") && drop) {
    buttonLabel = "Claim free";
    onClick = claim;
  } else if (phase === "minting") {
    buttonLabel = "Confirm in wallet…";
    buttonDisabled = true;
  } else if (phase === "done") {
    buttonLabel = "Claimed ✓";
    buttonDisabled = true;
  } else if (address && phase === "error" && !drop) {
    buttonLabel = "Retry";
    onClick = connect;
  }

  return (
    <section className="band" style={{ paddingTop: "clamp(90px, 10vw, 140px)" }}>
      <div className="wrap wrap--text">
        <div className="head">
          <span className="mono">Test claim</span>
          <h2>{CLAIM.label}</h2>
          <p>
            A free, one-per-wallet claim on {ROBINHOOD_CHAIN.name} — used to test the mint flow before the real
            Ruxxells drop.
          </p>
        </div>

        <div>
          <div
            style={{
              background: "var(--glass)",
              borderRadius: "var(--r-lg)",
              boxShadow: "var(--shadow)",
              padding: "26px",
              display: "grid",
              gap: "18px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <span className="mono" style={{ color: "var(--green)" }}>
                {drop?.collectionName ?? CLAIM.label}
              </span>
              <span className={`chip ${address ? "live" : ""}`}>
                <i className="dot" style={{ background: address ? "var(--green)" : "var(--faint)" }} />
                {address ? short(address) : "Not connected"}
              </span>
            </div>

            <dl className="miner__kv" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
              <div>
                <dt>Price</dt>
                <dd>{drop?.priceLabel ?? "—"}</dd>
              </div>
              <div>
                <dt>Per wallet</dt>
                <dd>{drop ? drop.maxPerWallet : "—"}</dd>
              </div>
              <div>
                <dt>You own</dt>
                <dd>{drop ? owned : "—"}</dd>
              </div>
            </dl>

            {error && <div className="banner banner--err">{error}</div>}

            {phase === "done" && txHash && (
              <div className="banner" style={{ background: "rgba(57,224,122,0.14)", color: "var(--green)" }}>
                Claimed. {" "}
                <a href={`${explorerUrl}/tx/${txHash}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>
                  View transaction
                </a>
              </div>
            )}

            <button className="btn btn--wide btn--xl" onClick={onClick} disabled={buttonDisabled}>
              {buttonLabel}
            </button>

            <p className="note">
              Contract: <span className="mono">{short(CLAIM.nftContract)}</span> on {ROBINHOOD_CHAIN.name} (chain id {ROBINHOOD_CHAIN.chainId}).
              If your wallet isn't on that network yet, connecting will prompt you to switch or add it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
