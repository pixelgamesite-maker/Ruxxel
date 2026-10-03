import { useCallback, useEffect, useRef, useState } from "react";
import { claimApi, ClaimError, ERROR_COPY, type ClaimStatus, type ClaimWindow } from "./index";

export type WindowPhase = "loading" | "upcoming" | "open" | "closed" | "error";

/**
 * Everything the claim page needs. The browser clock is never trusted: all
 * countdowns run off `serverOffset`, measured when the window config loads.
 * Real state (accepted, delivered) always comes from the backend; the
 * countdowns are only a picture of it.
 */
export function useClaim(
  wallet: string | null,
  sign: (message: string) => Promise<string>,
) {
  const [win, setWin] = useState<ClaimWindow | null>(null);
  const [offset, setOffset] = useState(0);
  const [winError, setWinError] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const [status, setStatus] = useState<ClaimStatus | null>(null);
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState<"" | "signing" | "sending">("");
  const [error, setError] = useState("");
  const live = useRef(true);

  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);

  /* window config + clock offset, re-synced every minute */
  useEffect(() => {
    if (!claimApi) return;
    let stop = false;
    const load = async () => {
      try {
        const t0 = Date.now();
        const w = await claimApi!.getWindow();
        if (stop) return;
        const rtt = Date.now() - t0;
        setOffset(w.serverTime + rtt / 2 - Date.now());
        setWin(w);
        setWinError(false);
      } catch {
        if (!stop) setWinError(true);
      }
    };
    void load();
    const id = window.setInterval(load, 60_000);
    return () => {
      stop = true;
      window.clearInterval(id);
    };
  }, []);

  /* tick, server-synced */
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now() + offset), 250);
    setNow(Date.now() + offset);
    return () => window.clearInterval(id);
  }, [offset]);

  /* status for the connected wallet */
  const refresh = useCallback(
    async (quiet = false) => {
      if (!claimApi || !wallet) return;
      if (!quiet) setChecking(true);
      try {
        const s = await claimApi.getStatus(wallet);
        if (live.current) setStatus(s);
      } catch (e) {
        if (live.current && !quiet) setError(ERROR_COPY[e instanceof ClaimError ? e.code : "network"]);
      } finally {
        if (live.current && !quiet) setChecking(false);
      }
    },
    [wallet],
  );

  useEffect(() => {
    setStatus(null);
    setError("");
    if (wallet) void refresh();
  }, [wallet, refresh]);

  /* poll while a claim is in flight, so refresh/return picks up where it left off */
  const inFlight = status?.state === "processing" || status?.state === "finalizing";
  useEffect(() => {
    if (!inFlight) return;
    const id = window.setInterval(() => void refresh(true), 4000);
    return () => window.clearInterval(id);
  }, [inFlight, refresh]);

  const claim = useCallback(async () => {
    if (!claimApi || !wallet) return;
    setError("");
    try {
      setBusy("signing");
      const { message, nonce } = await claimApi.challenge(wallet);
      const signature = await sign(message);
      setBusy("sending");
      const next = await claimApi.submit(wallet, nonce, signature);
      if (live.current) setStatus(next);
    } catch (e) {
      const code = e instanceof ClaimError ? e.code : "network";
      if (live.current) setError(ERROR_COPY[code]);
      // the server may have accepted before the response was lost
      if (code === "network" || code === "already_claimed") void refresh(true);
    } finally {
      if (live.current) setBusy("");
    }
  }, [wallet, sign, refresh]);

  let phase: WindowPhase = "loading";
  if (winError && !win) phase = "error";
  else if (win) phase = now < win.opensAt ? "upcoming" : now < win.closesAt ? "open" : "closed";

  return { win, now, phase, status, checking, busy, error, claim, refresh };
}
