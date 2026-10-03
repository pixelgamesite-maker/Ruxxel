import { useCallback, useEffect, useState } from "react";
import { claimMode } from "./index";
import { ClaimError } from "./types";

/**
 * Wallet connection. Today this talks to an injected wallet (MetaMask,
 * Rabby, the Robinhood Wallet in-app browser, etc.). It only ever asks the
 * wallet to SIGN A MESSAGE, never to send a transaction, so there is no gas
 * and no chain switch for the user.
 *
 * Mobile browsers without an injected wallet need WalletConnect (Reown
 * AppKit). That swap belongs in this one file: keep the returned shape.
 */

type Eip1193 = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?(event: string, handler: (...args: unknown[]) => void): void;
  removeListener?(event: string, handler: (...args: unknown[]) => void): void;
};

declare global {
  interface Window {
    ethereum?: Eip1193;
  }
}

const REMEMBER = "ruxxells_wallet_connected_v1";
const MOCK_ADDR = "ruxxells_mock_wallet_v1";

function mockAddress(): string {
  let a = localStorage.getItem(MOCK_ADDR);
  if (!a) {
    a = "0x" + Array.from({ length: 40 }, () => "0123456789abcdef"[Math.floor(Math.random() * 15) + 1]).join("");
    localStorage.setItem(MOCK_ADDR, a);
  }
  return a;
}

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  // Restore a previous connection without prompting.
  useEffect(() => {
    if (localStorage.getItem(REMEMBER) !== "1") return;
    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((a) => {
          const first = (a as string[])[0];
          if (first) setAddress(first.toLowerCase());
        })
        .catch(() => undefined);
    } else if (claimMode === "mock") {
      setAddress(mockAddress());
    }
  }, []);

  // Follow account switches made inside the wallet.
  useEffect(() => {
    const eth = window.ethereum;
    if (!eth?.on) return;
    const onAccounts = (...args: unknown[]) => {
      const first = (args[0] as string[] | undefined)?.[0];
      setAddress(first ? first.toLowerCase() : null);
      if (!first) localStorage.removeItem(REMEMBER);
    };
    eth.on("accountsChanged", onAccounts);
    return () => eth.removeListener?.("accountsChanged", onAccounts);
  }, []);

  const connect = useCallback(async () => {
    setError("");
    setConnecting(true);
    try {
      if (window.ethereum) {
        const a = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
        if (!a[0]) throw new Error("no account");
        setAddress(a[0].toLowerCase());
      } else if (claimMode === "mock") {
        setAddress(mockAddress());
      } else {
        setError("No wallet found. Open this page in your wallet's browser, or install one.");
        return;
      }
      localStorage.setItem(REMEMBER, "1");
    } catch {
      setError("The wallet connection was cancelled.");
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem(REMEMBER);
    setAddress(null);
    setError("");
  }, []);

  /** personal_sign over the server-issued message. */
  const signMessage = useCallback(
    async (message: string): Promise<string> => {
      if (!address) throw new ClaimError("rejected");
      if (!window.ethereum) {
        if (claimMode === "mock") return "0xmocksignature";
        throw new ClaimError("rejected");
      }
      try {
        return (await window.ethereum.request({
          method: "personal_sign",
          params: [message, address],
        })) as string;
      } catch {
        throw new ClaimError("rejected");
      }
    },
    [address],
  );

  return { address, connecting, error, connect, disconnect, signMessage };
}
