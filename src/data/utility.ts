/** Everything the post-mint ecosystem is built from. Copy lives here. */

export const LOOP = [
  {
    k: "Mine",
    t: "Mine RUXX",
    d: "Start a 24-hour session. Your Ruxxell produces RUXX Points the whole time, then stops and waits for you to claim.",
    tone: "green",
  },
  {
    k: "Excavate",
    t: "Spend it going deeper",
    d: "RUXX buys excavations. Shallow is quick and cheap, Core is slow and expensive with the best tables.",
    tone: "cyan",
  },
  {
    k: "Discover",
    t: "Find Fragments and Artifacts",
    d: "Fragments rebuild the world. Artifacts are rarer, some collectible, some carrying real boosts.",
    tone: "purple",
  },
  {
    k: "Reconstruct",
    t: "Raise World Integrity",
    d: "Spend Fragments to repair your fragment of the world. Integrity climbs from 0% toward 100%.",
    tone: "orange",
  },
  {
    k: "Evolve",
    t: "Change what it is",
    d: "Integrity pushes the Ruxxell through evolution stages, each one visible on the NFT and in the app.",
    tone: "pink",
  },
  {
    k: "Repeat",
    t: "Mine better, dig deeper",
    d: "Every improvement feeds the next session. A developed Ruxxell out-earns the one it started as.",
    tone: "green",
  },
] as const;

export const EXCAVATIONS = [
  {
    id: "shallow",
    name: "Shallow",
    cost: 120,
    hours: 4,
    tone: "green",
    fragment: 68,
    artifact: 6,
    depth: 1,
    blurb: "Quick pass near the surface. Cheap, reliable, mostly common Fragments.",
  },
  {
    id: "deep",
    name: "Deep",
    cost: 480,
    hours: 12,
    tone: "cyan",
    fragment: 82,
    artifact: 19,
    depth: 3,
    blurb: "Past the first strata. Better Fragment quality and a real shot at Artifacts.",
  },
  {
    id: "core",
    name: "Core",
    cost: 1450,
    hours: 36,
    tone: "pink",
    fragment: 94,
    artifact: 41,
    depth: 7,
    blurb: "All the way down. Most expensive run in the game and the only route to the deepest tables.",
  },
];

export const STAGES = [
  { k: "Fragmented", at: 0, d: "Untouched. The world is in pieces and mining runs at base rate." },
  { k: "Stabilized", at: 20, d: "The first repairs hold. Yield steadies and sessions stop drifting." },
  { k: "Reconstructed", at: 40, d: "Structure is back. Excavation efficiency improves noticeably." },
  { k: "Awakened", at: 70, d: "The world responds. Discovery odds climb and deeper tables unlock." },
  { k: "Converged", at: 100, d: "Fully rebuilt. Best multipliers in the game and a visibly different NFT." },
];

export const RARITIES = [
  { k: "Common", share: "44%", mult: "1.00×", tone: "var(--faint)" },
  { k: "Uncommon", share: "27%", mult: "1.15×", tone: "var(--green)" },
  { k: "Rare", share: "18%", mult: "1.35×", tone: "var(--cyan)" },
  { k: "Epic", share: "8%", mult: "1.60×", tone: "var(--violet)" },
  { k: "Legendary", share: "3%", mult: "1.90×", tone: "var(--orange)" },
];

export const WORLD_TYPES = [
  { k: "Volcanic", d: "Raw yield. The highest base RUXX rate of any world type.", stat: "+12% yield", tone: "orange" },
  { k: "Laboratory", d: "Built for finding things. Best Artifact odds on excavation.", stat: "+15% artifact", tone: "cyan" },
  { k: "Ancient", d: "Old ground, rich seams. Better rare Fragment odds.", stat: "+14% fragment", tone: "purple" },
  { k: "Frozen", d: "Nothing breaks down here. Sessions run at the steadiest rate.", stat: "+9% stability", tone: "green" },
  { k: "Orbital", d: "Long sightlines. Depth accrues faster per excavation.", stat: "+1 depth", tone: "pink" },
];

export const MULTIPLIER_CHAIN = [
  "Base Yield",
  "Rarity",
  "Rank",
  "Traits",
  "World Type",
  "Integrity",
  "Depth",
  "Boosts",
];

export const LEADERBOARD = [
  { rank: 1, token: "#0308", world: "Orbital deck", depth: 74, integrity: 100, ruxx: "412,880" },
  { rank: 2, token: "#0042", world: "Deep canyon", depth: 68, integrity: 92, ruxx: "388,410" },
  { rank: 3, token: "#0824", world: "Orbital deck", depth: 61, integrity: 88, ruxx: "341,905" },
  { rank: 4, token: "#1488", world: "Molten field", depth: 57, integrity: 84, ruxx: "309,270" },
  { rank: 5, token: "#0117", world: "Frozen station", depth: 52, integrity: 76, ruxx: "284,640" },
];

export const BOARDS = ["Top Miners", "Highest Yield", "Deepest Ruxxells", "Top Excavators", "Artifact Hunters"];

export const RAFFLES = [
  { k: "Holder", d: "Simply holding enters you into the base draw every cycle." },
  { k: "Mining", d: "Completed sessions convert into entries. Consistency pays." },
  { k: "Excavation", d: "Deeper runs are worth more entries than shallow ones." },
  { k: "Leaderboard", d: "Ranking on any board earns entries for that season." },
  { k: "Community", d: "Special draws run for events and milestones." },
];

/** Two Commons, same mint day, very different by now. */
export const RESALE = {
  untouched: {
    label: "Untouched Common",
    integrity: 0,
    depth: 2,
    artifacts: 0,
    stage: "Fragmented",
    yield: "19.8",
  },
  developed: {
    label: "Developed Common",
    integrity: 80,
    depth: 62,
    artifacts: 7,
    stage: "Awakened",
    yield: "46.2",
  },
};
