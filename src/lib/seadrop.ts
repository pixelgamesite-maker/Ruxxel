/**
 * Minimal ABI fragments for an ERC721SeaDrop collection + the canonical
 * SeaDrop contract. Nothing here is Ruxxells-specific — it's the standard
 * OpenSea SeaDrop interface, confirmed against the live SeaDrop contract.
 */

export const SEADROP_NFT_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  // Every ERC721SeaDrop token exposes the SeaDrop contract(s) it trusts.
  "function getAllowedSeaDrop() view returns (address[])",
];

export const SEADROP_ABI = [
  "function getPublicDrop(address nftContract) view returns (uint80 mintPrice, uint48 startTime, uint48 endTime, uint16 maxTotalMintableByWallet, uint16 feeBps, bool restrictFeeRecipients)",
  "function getAllowedFeeRecipients(address nftContract) view returns (address[])",
  "function mintPublic(address nftContract, address feeRecipient, address minterIfNotPayer, uint256 quantity) payable",
];
