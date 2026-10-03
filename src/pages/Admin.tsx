import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { RAFFLE_ADDRESS, RAFFLE_ABI, RAFFLE_IS_SET } from "@/lib/raffleContract";
import { parseAddressList, buildAllowlist, type AllowlistArtifact } from "@/lib/merkle";

const panel: CSSProperties = {
  border: "2px solid var(--line)",
  background: "var(--panel)",
  boxShadow: "8px 8px 0 rgba(0,0,0,0.55)",
  marginBottom: 26,
};
const panelHead: CSSProperties = {
  padding: "13px 18px",
  borderBottom: "2px solid var(--line)",
};
const panelBody: CSSProperties = { padding: 20, display: "grid", gap: 14 };
const input: CSSProperties = {
  width: "100%",
  padding: "12px 13px",
  border: "2px solid var(--line)",
  background: "var(--bg)",
  fontFamily: "var(--mono)",
  fontSize: 14,
  color: "var(--text)",
  outline: "none",
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={panel}>
      <div style={panelHead}>
        <span className="tag tag--mute" style={{ fontSize: 11 }}>
          {title}
        </span>
      </div>
      <div style={panelBody}>{children}</div>
    </section>
  );
}

function short(x: string) {
  return `${x.slice(0, 10)}…${x.slice(-8)}`;
}

export default function Admin() {
  const { address, isConnected } = useAccount();
  const fileRef = useRef<HTMLInputElement>(null);

  const contract = { address: RAFFLE_ADDRESS, abi: RAFFLE_ABI } as const;
  const { data, refetch } = useReadContracts({
    contracts: [
      { ...contract, functionName: "owner" },
      { ...contract, functionName: "merkleRoot" },
      { ...contract, functionName: "entryDeadline" },
      { ...contract, functionName: "isOpen" },
      { ...contract, functionName: "depositedCount" },
      { ...contract, functionName: "entrantsCount" },
      { ...contract, functionName: "remainingToDistribute" },
      { ...contract, functionName: "swept" },
    ],
    query: { enabled: RAFFLE_IS_SET, refetchInterval: 12000 },
  });

  const owner = data?.[0]?.result as string | undefined;
  const merkleRoot = data?.[1]?.result as string | undefined;
  const entryDeadline = data?.[2]?.result as bigint | undefined;
  const isOpen = data?.[3]?.result as boolean | undefined;
  const deposited = data?.[4]?.result as bigint | undefined;
  const entrants = data?.[5]?.result as bigint | undefined;
  const remaining = data?.[6]?.result as bigint | undefined;
  const swept = data?.[7]?.result as boolean | undefined;

  const isOwner =
    isConnected && !!address && typeof owner === "string" && owner.toLowerCase() === address.toLowerCase();

  const rootSet = !!merkleRoot && /[1-9a-f]/i.test(merkleRoot.slice(2));
  const opened = entryDeadline !== undefined && entryDeadline !== 0n;

  // ---- allowlist build (client-side) --------------------------------------
  const [fileName, setFileName] = useState("");
  const [csvText, setCsvText] = useState("");
  const parsed = useMemo(() => (csvText ? parseAddressList(csvText) : null), [csvText]);
  const [artifact, setArtifact] = useState<AllowlistArtifact | null>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setArtifact(null);
    const r = new FileReader();
    r.onload = () => setCsvText(String(r.result ?? ""));
    r.readAsText(f);
  }

  function generate() {
    if (!parsed) return;
    setArtifact(buildAllowlist(parsed.addresses));
  }

  function downloadArtifact() {
    if (!artifact) return;
    const blob = new Blob([JSON.stringify(artifact)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "allowlist.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  // ---- write hooks ---------------------------------------------------------
  const rootWrite = useWriteContract();
  const rootRcpt = useWaitForTransactionReceipt({ hash: rootWrite.data });
  const openWrite = useWriteContract();
  const openRcpt = useWaitForTransactionReceipt({ hash: openWrite.data });
  const distWrite = useWriteContract();
  const distRcpt = useWaitForTransactionReceipt({ hash: distWrite.data });
  const sweepWrite = useWriteContract();
  const sweepRcpt = useWaitForTransactionReceipt({ hash: sweepWrite.data });

  if (rootRcpt.isSuccess || openRcpt.isSuccess || distRcpt.isSuccess || sweepRcpt.isSuccess) {
    // fire-and-forget refresh when any tx lands
    void refetch();
  }

  const [durationMin, setDurationMin] = useState("30");
  const [batch, setBatch] = useState("50");

  function setRoot() {
    if (!artifact) return;
    rootWrite.reset();
    rootWrite.writeContract({ ...contract, functionName: "setMerkleRoot", args: [artifact.root] });
  }
  function openEntries() {
    const secs = Math.round(Number(durationMin) * 60);
    if (!Number.isFinite(secs) || secs <= 0) return;
    openWrite.reset();
    openWrite.writeContract({ ...contract, functionName: "openEntries", args: [BigInt(secs)] });
  }
  function distribute() {
    const n = Number(batch);
    if (!Number.isFinite(n) || n <= 0) return;
    distWrite.reset();
    distWrite.writeContract({ ...contract, functionName: "distribute", args: [BigInt(Math.round(n))] });
  }
  function sweep() {
    sweepWrite.reset();
    sweepWrite.writeContract({ ...contract, functionName: "sweepUnclaimed", args: [] });
  }

  const btn = (label: string, onClick: () => void, disabled: boolean, ghost = false) => (
    <button
      className={`btn ${ghost ? "btn--ghost" : "btn--lime"} btn--wide`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );

  const err = (w: { error: unknown }) =>
    (w.error as { shortMessage?: string } | null)?.shortMessage ?? null;

  // ---- gates ---------------------------------------------------------------
  if (!RAFFLE_IS_SET) {
    return (
      <section className="inset section">
        <div className="claim" style={{ textAlign: "center" }}>
          <p className="note">Raffle contract address not set (VITE_RAFFLE_ADDRESS).</p>
        </div>
      </section>
    );
  }

  return (
    <section className="inset section">
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
          <div>
            <span className="tag tag--mute">Owner only</span>
            <h1 className="claim__title px" style={{ marginTop: 10 }}>
              Admin
            </h1>
          </div>
          <ConnectButton showBalance={false} chainStatus="icon" />
        </div>

        {!isConnected && <p className="note">Connect the owner wallet to continue.</p>}
        {isConnected && !isOwner && (
          <div className="banner">This wallet isn't the contract owner. Connect {owner ? short(owner) : "the owner"}.</div>
        )}

        {isOwner && (
          <>
            {/* status */}
            <Section title="Status">
              <dl className="stats" style={{ marginTop: 0, gridTemplateColumns: "repeat(2, 1fr)" }}>
                <div className="stat">
                  <dt>Phase</dt>
                  <dd>{!opened ? "Not open" : isOpen ? "Open" : "Closed"}</dd>
                </div>
                <div className="stat">
                  <dt>Allowlist</dt>
                  <dd>{rootSet ? "Set" : "None"}</dd>
                </div>
                <div className="stat">
                  <dt>Deposited</dt>
                  <dd>{deposited !== undefined ? deposited.toString() : "—"}</dd>
                </div>
                <div className="stat">
                  <dt>Entrants</dt>
                  <dd>{entrants !== undefined ? entrants.toString() : "—"}</dd>
                </div>
              </dl>
              <p className="note" style={{ margin: 0 }}>
                Root: <span className="mono">{rootSet && merkleRoot ? short(merkleRoot) : "not set"}</span>
                {remaining !== undefined && opened && !isOpen ? ` · ${remaining.toString()} left to distribute` : ""}
                {swept ? " · swept" : ""}
              </p>
            </Section>

            {/* allowlist */}
            <Section title="1 · Eligible wallets">
              <input ref={fileRef} type="file" accept=".csv,.txt,text/csv" onChange={onFile} style={{ display: "none" }} />
              <button className="btn btn--ghost btn--wide" onClick={() => fileRef.current?.click()}>
                {fileName || "Choose wallet CSV"}
              </button>
              {parsed && (
                <p className="note" style={{ margin: 0 }}>
                  {parsed.addresses.length} unique wallet{parsed.addresses.length === 1 ? "" : "s"}
                  {parsed.duplicates > 0 ? ` · ${parsed.duplicates} duplicate(s) removed` : ""}
                  {parsed.skipped.length > 0 ? ` · ${parsed.skipped.length} line(s) skipped` : ""}
                </p>
              )}
              {parsed && parsed.addresses.length > 0 && !artifact && btn("Build merkle tree", generate, false)}
              {artifact && (
                <div className="banner banner--ok" style={{ display: "grid", gap: 10 }}>
                  <span>
                    Tree built — {artifact.count} wallets. Root <span className="mono">{short(artifact.root)}</span>
                  </span>
                  <button className="btn btn--ghost btn--sm" onClick={downloadArtifact}>
                    Download allowlist.json
                  </button>
                  <span className="note" style={{ color: "var(--faint)" }}>
                    Commit the downloaded file to <span className="mono">public/allowlist.json</span> and redeploy, so the
                    claim page can look up proofs. Then set the root on-chain below.
                  </span>
                </div>
              )}
              {artifact &&
                btn(
                  rootWrite.isPending ? "Confirm in wallet…" : rootRcpt.isLoading ? "Setting root…" : "Set root on-chain",
                  setRoot,
                  rootWrite.isPending || rootRcpt.isLoading,
                )}
              {err(rootWrite) && <div className="banner">{err(rootWrite)}</div>}
              {rootRcpt.isSuccess && <p className="note" style={{ margin: 0, color: "var(--lime)" }}>Root is live on-chain.</p>}
            </Section>

            {/* open */}
            <Section title="2 · Start the claim">
              <label className="note" style={{ margin: 0 }}>
                Window length (minutes)
              </label>
              <input type="number" min={1} value={durationMin} onChange={(e) => setDurationMin(e.target.value)} style={input} />
              {btn(
                openWrite.isPending ? "Confirm in wallet…" : openRcpt.isLoading ? "Opening…" : opened ? "Already opened" : "Open claim",
                openEntries,
                opened || openWrite.isPending || openRcpt.isLoading || !rootSet || (deposited ?? 0n) === 0n,
              )}
              <p className="note" style={{ margin: 0, color: "var(--faint)" }}>
                Needs NFTs deposited and the allowlist root set first. Can only be opened once.
              </p>
              {err(openWrite) && <div className="banner">{err(openWrite)}</div>}
            </Section>

            {/* distribute */}
            <Section title="3 · Distribute (after close)">
              <label className="note" style={{ margin: 0 }}>
                Batch size
              </label>
              <input type="number" min={1} value={batch} onChange={(e) => setBatch(e.target.value)} style={input} />
              {btn(
                distWrite.isPending ? "Confirm in wallet…" : distRcpt.isLoading ? "Distributing…" : "Distribute batch",
                distribute,
                !opened || isOpen !== false || (remaining ?? 0n) === 0n || distWrite.isPending || distRcpt.isLoading,
              )}
              <p className="note" style={{ margin: 0, color: "var(--faint)" }}>
                Enabled once the window closes. Repeat until "left to distribute" reaches 0.
              </p>
              {err(distWrite) && <div className="banner">{err(distWrite)}</div>}
            </Section>

            {/* sweep */}
            <Section title="4 · Sweep leftovers to vault">
              {btn(
                sweepWrite.isPending ? "Confirm in wallet…" : sweepRcpt.isLoading ? "Sweeping…" : swept ? "Already swept" : "Sweep unclaimed",
                sweep,
                !opened || isOpen !== false || (remaining ?? 1n) !== 0n || swept === true || sweepWrite.isPending || sweepRcpt.isLoading,
                true,
              )}
              <p className="note" style={{ margin: 0, color: "var(--faint)" }}>
                Sends any NFTs beyond what entrants used back to the team vault. Enabled once distribution is complete.
              </p>
              {err(sweepWrite) && <div className="banner">{err(sweepWrite)}</div>}
            </Section>
          </>
        )}
      </div>
    </section>
  );
}
