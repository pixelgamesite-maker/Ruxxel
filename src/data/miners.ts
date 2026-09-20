import { PIXELS } from "./site";

export type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic";

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
    id: "m2",
    token: "#0117",
    role: "Engineer",
    world: "Frozen station",
    rarity: "Epic",
    tone: "purple",
    hash: 964,
    rux: 31.4,
    uptime: 97.8,
    art: PIXELS[1],
  },
  {
    id: "m3",
    token: "#0308",
    role: "Trader",
    world: "Orbital deck",
    rarity: "Mythic",
    tone: "pink",
    hash: 1710,
    rux: 58.9,
    uptime: 99.7,
    art: PIXELS[2],
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
    id: "m5",
    token: "#0824",
    role: "Commander",
    world: "Orbital deck",
    rarity: "Legendary",
    tone: "orange",
    hash: 1436,
    rux: 47.3,
    uptime: 98.9,
    art: PIXELS[4],
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
