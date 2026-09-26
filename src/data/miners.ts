import { PIXELS } from "./site";

export type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

/** Worlds are open-ended strings. This list only keeps spelling consistent. */
export const WORLDS = [
  "Deep canyon",
  "Frozen station",
  "Orbital deck",
  "Molten field",
  "Deep water lab",
  "Ancient temple",
  "Cloud field",
] as const;

export type Miner = {
  id: string;
  token: string;
  world: string;
  worldType: string;
  rarity: Rarity;
  rank: number;
  tone: "green" | "cyan" | "pink" | "orange" | "purple";
  /** Mining strength. The dashboard drifts around this. */
  hash: number;
  /** RUXX Points per hour at the current multiplier. */
  yield: number;
  integrity: number;
  depth: number;
  artifacts: number;
  stage: string;
  art: string;
};

export const RARITY_TONE: Record<Rarity, string> = {
  Common: "var(--faint)",
  Uncommon: "var(--green)",
  Rare: "var(--cyan)",
  Epic: "var(--violet)",
  Legendary: "var(--orange)",
};

export const MINERS: Miner[] = [
  { id: "m1", token: "#0042", world: "Deep canyon", worldType: "Ancient", rarity: "Legendary", rank: 14, tone: "cyan", hash: 1284, yield: 42.6, integrity: 92, depth: 68, artifacts: 11, stage: "Converged", art: PIXELS[0] },
  { id: "m2", token: "#0117", world: "Frozen station", worldType: "Frozen", rarity: "Epic", rank: 118, tone: "purple", hash: 964, yield: 31.4, integrity: 76, depth: 52, artifacts: 6, stage: "Awakened", art: PIXELS[1] },
  { id: "m3", token: "#0308", world: "Orbital deck", worldType: "Orbital", rarity: "Legendary", rank: 3, tone: "pink", hash: 1710, yield: 58.9, integrity: 100, depth: 74, artifacts: 17, stage: "Converged", art: PIXELS[2] },
  { id: "m4", token: "#0561", world: "Molten field", worldType: "Volcanic", rarity: "Rare", rank: 402, tone: "green", hash: 742, yield: 24.1, integrity: 44, depth: 21, artifacts: 3, stage: "Reconstructed", art: PIXELS[3] },
  { id: "m5", token: "#0824", world: "Orbital deck", worldType: "Orbital", rarity: "Legendary", rank: 27, tone: "orange", hash: 1436, yield: 47.3, integrity: 88, depth: 61, artifacts: 9, stage: "Awakened", art: PIXELS[4] },
  { id: "m6", token: "#1203", world: "Deep water lab", worldType: "Laboratory", rarity: "Uncommon", rank: 908, tone: "green", hash: 618, yield: 19.8, integrity: 20, depth: 8, artifacts: 1, stage: "Stabilized", art: PIXELS[5] },
  { id: "m7", token: "#0679", world: "Ancient temple", worldType: "Ancient", rarity: "Rare", rank: 351, tone: "cyan", hash: 806, yield: 26.4, integrity: 60, depth: 34, artifacts: 5, stage: "Reconstructed", art: PIXELS[6] },
  { id: "m8", token: "#1488", world: "Molten field", worldType: "Volcanic", rarity: "Epic", rank: 96, tone: "orange", hash: 1122, yield: 37.2, integrity: 84, depth: 57, artifacts: 8, stage: "Awakened", art: PIXELS[7] },
  { id: "m9", token: "#0915", world: "Cloud field", worldType: "Orbital", rarity: "Common", rank: 1502, tone: "purple", hash: 534, yield: 17.3, integrity: 0, depth: 2, artifacts: 0, stage: "Fragmented", art: PIXELS[8] },
];
