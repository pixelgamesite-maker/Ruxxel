/** Brand + site-wide constants. Edit copy here, not in components. */

export const BRAND = {
  name: "Ruxxells",
  tagline: "Every Ruxxell is an explorable fragment of another world",
  chain: "Robinhood Chain",
  x: "https://x.com/ruxxellsHQ",
  handle: "@ruxxellsHQ",
  /** Update once the collection page exists. */
  launchpad: "https://opensea.io/collection/ruxxells",
};

export const COLLECTION = {
  supply: 1970,
  supplyLabel: "1,970",
  mintPrice: "TBA",
  chain: "Robinhood Chain",
  status: "Contract not yet deployed",
};

/**
 * Artwork lives in /public. Filenames build from these constants, so a rename
 * is a one-line edit here.
 */
const ART_NAME = "ruxxells";
const ART_EXT = "jpeg";
export const ART_COUNT = 20;

export const PIXELS = Array.from({ length: ART_COUNT }, (_, i) => `/${ART_NAME}${i + 1}.${ART_EXT}`);

/** Video loops. Add filenames as you export them. */
export const MOTION = [`/${ART_NAME}1.mp4`];

/** The first file that loads wins, so .jpg/.png/.jpeg all work. */
export const LOGO_CANDIDATES = ["/logo.jpg", "/logo.png", "/logo.jpeg"];

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/mine", label: "Mining" },
  { href: "/dig", label: "Excavation" },
  { href: "/worlds", label: "Worlds" },
  { href: "/mint", label: "Mint" },
];

export const ROADMAP = [
  { k: "Now", t: "Access list", d: "Four steps, read by a human. No bots, no first-come scramble." },
  { k: "Next", t: "Mint", d: `${COLLECTION.supplyLabel} Ruxxells on ${COLLECTION.chain}. Price announced on X first.` },
  { k: "Then", t: "Reveal", d: "Traits, rarity and world type resolve. That metadata becomes your starting DNA." },
  { k: "After", t: "Connect and mine", d: "Link your wallet, see every Ruxxell you hold, start the first 24-hour session." },
  { k: "Later", t: "Excavation opens", d: "Spend RUXX to dig. Fragments, Artifacts and Depth come online." },
  { k: "Eventually", t: "$RUXX", d: "Points convert once the economy has real numbers behind it to balance against." },
];

export const DISCLAIMER =
  "Mint date and price are not final. Stats shown on this site are illustrative. Nothing here is financial advice.";
