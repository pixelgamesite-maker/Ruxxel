import { keccak256, encodePacked, isAddress, getAddress } from "viem";

/**
 * Merkle allowlist, built to match RuxxellsRaffle.sol exactly:
 *   leaf   = keccak256(abi.encodePacked(address))   (the 20 raw address bytes)
 *   parent = keccak256(sorted(left, right))          (sorted-pair hashing)
 * This is the same scheme as OpenZeppelin MerkleProof and merkletreejs
 * { sortPairs: true }, so proofs generated here verify in the contract.
 *
 * Implemented with viem (already a dep) rather than merkletreejs, so it runs
 * in the browser with no Buffer polyfill.
 */

export type Hex = `0x${string}`;

export function leafFor(address: string): Hex {
  return keccak256(encodePacked(["address"], [getAddress(address)]));
}

/** keccak256 of two 32-byte hashes concatenated in sorted (ascending) order. */
function hashPair(a: Hex, b: Hex): Hex {
  const [lo, hi] = a.toLowerCase() <= b.toLowerCase() ? [a, b] : [b, a];
  return keccak256(("0x" + lo.slice(2) + hi.slice(2)) as Hex);
}

/**
 * Parse a CSV/newline list of wallets. Only the first column of each line is
 * read; a header row containing "address" is skipped; invalid lines are
 * returned in `skipped`. Deduped case-insensitively.
 */
export function parseAddressList(text: string): {
  addresses: Hex[];
  skipped: string[];
  duplicates: number;
} {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const raw: Hex[] = [];
  const skipped: string[] = [];
  let sawHeader = false;

  for (const line of lines) {
    const first = line.split(",")[0].trim().replace(/^"|"$/g, "");
    if (isAddress(first)) {
      raw.push(getAddress(first));
    } else if (!sawHeader && /address/i.test(first)) {
      sawHeader = true;
    } else {
      skipped.push(line);
    }
  }

  const seen = new Set<string>();
  const addresses: Hex[] = [];
  for (const a of raw) {
    const key = a.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    addresses.push(a);
  }

  return { addresses, skipped, duplicates: raw.length - addresses.length };
}

type Layer = Hex[];

function buildLayers(leaves: Hex[]): Layer[] {
  if (leaves.length === 0) return [[]];
  const layers: Layer[] = [leaves];
  let current = leaves;
  while (current.length > 1) {
    const next: Hex[] = [];
    for (let i = 0; i < current.length; i += 2) {
      if (i + 1 < current.length) {
        next.push(hashPair(current[i], current[i + 1]));
      } else {
        next.push(current[i]); // odd node carries up unchanged (merkletreejs default)
      }
    }
    layers.push(next);
    current = next;
  }
  return layers;
}

function proofFromLayers(layers: Layer[], index: number): Hex[] {
  const proof: Hex[] = [];
  let idx = index;
  for (let l = 0; l < layers.length - 1; l++) {
    const layer = layers[l];
    const isRight = idx % 2 === 1;
    const pairIdx = isRight ? idx - 1 : idx + 1;
    if (pairIdx < layer.length) proof.push(layer[pairIdx]);
    idx = Math.floor(idx / 2);
  }
  return proof;
}

export type AllowlistArtifact = {
  root: Hex;
  count: number;
  /** address (checksummed) -> its proof */
  proofs: Record<string, Hex[]>;
};

/** Build the full tree: root + a proof for every address. */
export function buildAllowlist(addresses: Hex[]): AllowlistArtifact {
  if (addresses.length === 0) {
    return { root: ("0x" + "0".repeat(64)) as Hex, count: 0, proofs: {} };
  }
  const leaves = addresses.map(leafFor);
  const layers = buildLayers(leaves);
  const root = layers[layers.length - 1][0];
  const proofs: Record<string, Hex[]> = {};
  addresses.forEach((addr, i) => {
    proofs[addr] = proofFromLayers(layers, i);
  });
  return { root, count: addresses.length, proofs };
}

/** Verify locally (same logic as the contract) — handy for the claim page. */
export function verifyProof(address: string, proof: Hex[], root: Hex): boolean {
  let computed = leafFor(address);
  for (const p of proof) computed = hashPair(computed, p);
  return computed.toLowerCase() === root.toLowerCase();
}
