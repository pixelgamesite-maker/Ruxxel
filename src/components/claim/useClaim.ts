import { useCallback, useEffect, useState } from "react";
import { BrowserProvider, Contract, ZeroAddress, formatEther } from "ethers";
import { ROBINHOOD_CHAIN, CLAIM } from "@/data/chain";
import { SEADROP_ABI, SEADROP_NFT_ABI } from "@/lib/seadrop";

type Phase = "idle" | "connecting" | "loading" | "ready" | "minting" | "done" | "error";

type DropInfo = {
  seadrop: string;
  collectionName: string;
  price: bigint;
  maxPerWallet: number;
  feeRecipient: string;
};

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, cb: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, cb: (...args: unknown[]) => void) => void;
}

/**
 * `window.ethereum`'s global type now comes from wagmi's own dependencies
 * (viem/Coinbase Wallet SDK), so this file no longer declares it itself --
 * that caused a type conflict with their declaration. This helper just
 * narrows it back to the shape this file actually uses.
 */
const getEthereum = (): EthereumProvider | undefined => window.ethereum as EthereumProvider | undefined;

export function useClaim() {
  const [address, setAddress] = useState<string | null>(null);
  const [onRightChain, setOnRightChain] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string>("");
  const [drop, setDrop] = useState<DropInfo | null>(null);
  const [owned, setOwned] = useState<number>(0);
  const [txHash, setTxHash] = useState<string>("");

  const hasWallet = typeof window !== "undefined" && !!getEthereum();

  const loadDrop = useCallback(async (acct: string) => {
    const eth = getEthereum();
    if (!eth) return;
    setPhase("loading");
    setError("");
    try {
      const provider = new BrowserProvider(eth);
      const nft = new Contract(CLAIM.nftContract, SEADROP_NFT_ABI, provider);

      const [name, allowed, balance] = await Promise.all([
        nft.name().catch(() => CLAIM.label),
        nft.getAllowedSeaDrop(),
        nft.balanceOf(acct).catch(() => 0n),
      ]);

      const seadropAddress: string | undefined = allowed?.[0];
      if (!seadropAddress) throw new Error("This contract has no SeaDrop configured.");

      const seadrop = new Contract(seadropAddress, SEADROP_ABI, provider);
      const [publicDrop, feeRecipients] = await Promise.all([
        seadrop.getPublicDrop(CLAIM.nftContract),
        seadrop.getAllowedFeeRecipients(CLAIM.nftContract),
      ]);

      setDrop({
        seadrop: seadropAddress,
        collectionName: name,
        price: publicDrop.mintPrice as bigint,
        maxPerWallet: Number(publicDrop.maxTotalMintableByWallet),
        feeRecipient: (feeRecipients?.[0] as string) ?? ZeroAddress,
      });
      setOwned(Number(balance));
      setPhase("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read the drop configuration.");
      setPhase("error");
    }
  }, []);

  const ensureChain = useCallback(async () => {
    const eth = getEthereum();
    if (!eth) return false;
    const currentHex = (await eth.request({ method: "eth_chainId" })) as string;
    if (currentHex?.toLowerCase() === ROBINHOOD_CHAIN.chainIdHex.toLowerCase()) {
      setOnRightChain(true);
      return true;
    }
    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ROBINHOOD_CHAIN.chainIdHex }],
      });
      setOnRightChain(true);
      return true;
    } catch (switchErr) {
      const code = (switchErr as { code?: number })?.code;
      if (code === 4902) {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: ROBINHOOD_CHAIN.chainIdHex,
              chainName: ROBINHOOD_CHAIN.name,
              rpcUrls: ROBINHOOD_CHAIN.rpcUrls,
              nativeCurrency: ROBINHOOD_CHAIN.nativeCurrency,
              blockExplorerUrls: ROBINHOOD_CHAIN.blockExplorerUrls,
            },
          ],
        });
        setOnRightChain(true);
        return true;
      }
      setError("Switch your wallet to Robinhood Chain to continue.");
      setOnRightChain(false);
      return false;
    }
  }, []);

  const connect = useCallback(async () => {
    const eth = getEthereum();
    if (!eth) {
      setError("No wallet found. Install MetaMask or another EVM wallet extension.");
      setPhase("error");
      return;
    }
    setPhase("connecting");
    setError("");
    try {
      const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
      const acct = accounts?.[0];
      if (!acct) throw new Error("No account returned by wallet.");
      setAddress(acct);

      const ok = await ensureChain();
      if (!ok) {
        setPhase("error");
        return;
      }
      await loadDrop(acct);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect wallet.");
      setPhase("error");
    }
  }, [ensureChain, loadDrop]);

  const claim = useCallback(async () => {
    const eth = getEthereum();
    if (!eth || !address || !drop) return;
    setPhase("minting");
    setError("");
    try {
      const provider = new BrowserProvider(eth);
      const signer = await provider.getSigner();
      const seadrop = new Contract(drop.seadrop, SEADROP_ABI, signer);

      const tx = await seadrop.mintPublic(CLAIM.nftContract, drop.feeRecipient, ZeroAddress, 1n, {
        value: drop.price,
      });
      const receipt = await tx.wait(1);
      setTxHash(receipt?.hash ?? tx.hash);
      setOwned((n) => n + 1);
      setPhase("done");
    } catch (err) {
      const message = (err as { shortMessage?: string; message?: string })?.shortMessage
        ?? (err as Error)?.message
        ?? "Claim failed.";
      setError(message);
      setPhase("error");
    }
  }, [address, drop]);

  // Keep in sync if the user switches accounts or networks in their wallet.
  useEffect(() => {
    const eth = getEthereum();
    if (!eth?.on) return;
    const onAccounts = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (!accounts?.length) {
        setAddress(null);
        setPhase("idle");
        return;
      }
      setAddress(accounts[0]);
      void loadDrop(accounts[0]);
    };
    const onChain = () => {
      void ensureChain();
    };
    eth.on("accountsChanged", onAccounts);
    eth.on("chainChanged", onChain);
    return () => {
      eth.removeListener?.("accountsChanged", onAccounts);
      eth.removeListener?.("chainChanged", onChain);
    };
  }, [ensureChain, loadDrop]);

  return {
    hasWallet,
    address,
    onRightChain,
    phase,
    error,
    drop: drop
      ? {
          ...drop,
          priceLabel: drop.price === 0n ? "Free" : `${formatEther(drop.price)} ETH`,
        }
      : null,
    owned,
    txHash,
    connect,
    claim,
    explorerUrl: ROBINHOOD_CHAIN.blockExplorerUrls[0],
  };
}
