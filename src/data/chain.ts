/** Robinhood Chain network config + the collection this claim page points at. */

export const ROBINHOOD_CHAIN = {
  chainId: 4663,
  chainIdHex: "0x1237",
  name: "Robinhood Chain",
  rpcUrls: ["https://rpc.mainnet.chain.robinhood.com"],
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  blockExplorerUrls: ["https://robinhoodchain.blockscout.com"],
};

export const CLAIM = {
  /** Display name only — the real name is read from the contract once connected. */
  label: "Ruxxell Test Claim",
  nftContract: "0xb2968ed4c7e7a35B9A07acEE1eA96F3A6d5682dF",
};
