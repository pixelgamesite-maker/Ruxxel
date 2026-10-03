import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";
import { ROBINHOOD_CHAIN } from "@/data/chain";

/**
 * viem chain definition for Robinhood Chain, built from the single source of
 * truth in `data/chain.ts` so the wagmi/RainbowKit config and the raw-wallet
 * code (`lib/claim/useWallet.ts`, `components/claim/useClaim.ts`) never
 * disagree about chain id or RPC URL.
 */
export const robinhoodChain = defineChain({
  id: ROBINHOOD_CHAIN.chainId,
  name: ROBINHOOD_CHAIN.name,
  nativeCurrency: ROBINHOOD_CHAIN.nativeCurrency,
  rpcUrls: {
    default: { http: ROBINHOOD_CHAIN.rpcUrls },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: ROBINHOOD_CHAIN.blockExplorerUrls[0],
    },
  },
});

/**
 * WalletConnect project id -- required by RainbowKit even if you only ever
 * use injected wallets (MetaMask, etc.), since it also powers the QR-code /
 * mobile-wallet flow. Get a free one at https://cloud.reown.com and set
 * VITE_WALLETCONNECT_PROJECT_ID in .env -- without it, wallet connect (the
 * mobile/QR option) is disabled but injected wallets still work fine.
 */
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "";

if (!projectId && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn(
    "[web3] VITE_WALLETCONNECT_PROJECT_ID is not set -- WalletConnect (mobile/QR) will be unavailable. " +
      "Get a free project id at https://cloud.reown.com and add it to .env.",
  );
}

export const wagmiConfig = getDefaultConfig({
  appName: "Ruxxells",
  projectId: projectId || "MISSING_WALLETCONNECT_PROJECT_ID",
  chains: [robinhoodChain],
  ssr: false,
});
