import { PIXELS } from "./site";

export type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic";

/**
 * Worlds are just strings — add as many as the collection has, no fixed set.
 * This list is only here so the names stay spelled the same way everywhere.
 */
export const WORLDS = [
  "Deep canyon",
  "Frozen station",
  "Orbital deck",
  "Molten field",
  "Deep water lab",
] as const;

export type Miner = {
  id: string;
  token: string;
  role: string;
  world: string;
  rarity: Rarity;
  tone: "green" | "cyan" | "pink" | "orange" | "purple";
  /** Base hash rate in H/s. The card drifts around this. */
  hash: number;
  /** Base $RUX earned per hour. */
  rux: number;
  uptime: number;
  art: string;
};

export const RARITY_TONE: Record<Rarity, string> = {
  Common: "var(--faint)",
  Uncommon: "var(--green)",
  Rare: "var(--cyan)",
  Epic: "var(--violet)",
  Legendary: "var(--orange)",
  Mythic: "var(--magenta)",
};

export const MINERS: Miner[] = [
  {
    id: "m1",
    token: "#0042",
    role: "Scientist",
    world: "Deep canyon",
    rarity: "Legendary",
    tone: "cyan",
    hash: 1284,
    rux: 42.6,
    uptime: 99.2,
    art: PIXELS[0],
  },
  {
    id: "m4",
    token: "#0561",
    role: "Scout",
    world: "Molten field",
    rarity: "Rare",
    tone: "green",
    hash: 742,
    rux: 24.1,
    uptime: 96.4,
    art: PIXELS[3],
  },
  {
    id: "m6",
    token: "#1203",
    role: "Engineer",
    world: "Deep water lab",
    rarity: "Uncommon",
    tone: "green",
    hash: 618,
    rux: 19.8,
    uptime: 95.1,
    art: PIXELS[5],
  },
];
