/** Brand + site-wide constants. Edit copy here, not in components. */

export const BRAND = {
  name: "Ruxxells",
  chain: "Robinhood Chain",
  x: "https://x.com/ruxxellsHQ",
  handle: "@ruxxellsHQ",
  /** Used by "View on OpenSea" unless VITE_OPENSEA_URL is set. */
  launchpad: import.meta.env.VITE_OPENSEA_URL || "https://opensea.io/collection/ruxxells",
};

export const COLLECTION = {
  supply: 1970,
  supplyLabel: "1,970",
  mintPrice: "TBA",
  chainShort: "Robinhood",
  /** Shown next to "Minting on Robinhood". */
  mintStatus: "Closed",
};

/** Robinhood Chain mainnet explorer (Blockscout). */
export const EXPLORER_TX = "https://robinhoodchain.blockscout.com/tx/";

export const NAV = [
  { href: "/checkpoint", label: "Checkpoint", primary: true },
  { href: "/gallery", label: "Gallery", primary: false },
];

/** Flip to true when the free claim opens, so it shows in the top bar. */
export const SHOW_CLAIM_IN_NAV = false;

/* ------------------------------------------------------------------ art -- */

const art = (n: number) => `/ruxxells${n}.jpeg`;

/** Sector rooms. 01 and 02 need their own files dropped into /public. */
export const SECTORS = [
  {
    no: "01",
    name: "The Holding Bay",
    line: "Concrete, chain-link and crates nobody will open. Everyone starts here.",
    img: "/sector-1.jpeg",
    tone: "blue",
  },
  {
    no: "02",
    name: "The Greenhouse",
    line: "Vines, grow beds and one arcade cabinet, with lava under the floor.",
    img: "/sector-2.jpeg",
    tone: "red",
  },
  {
    no: "03",
    name: "The Deep Freeze",
    line: "The rigs never stopped running. The bears moved in anyway.",
    img: art(16),
    tone: "teal",
  },
  {
    no: "04",
    name: "The Dig",
    line: "They found the pyramid first and the door underneath it second.",
    img: art(6),
    tone: "violet",
  },
] as const;

/** Sector art that is also one of the 20 files, so the marquee skips it. */
const SECTOR_FILES = new Set([art(16), art(6)]);

/** "Eighteen more": every numbered file that is not a sector image. */
export const REST = Array.from({ length: 20 }, (_, i) => art(i + 1)).filter((f) => !SECTOR_FILES.has(f));

/** 512px thumbnail of a numbered artwork (marquee + gallery grid). */
export const thumb = (src: string) => src.replace(/^\/ruxxells(\d+)\.jpeg$/, "/thumbs/ruxxells$1.jpg");

/** The hero banner crop. */
export const HERO_IMG = art(5);

export const LOGO = "/logo.jpg";

export const DISCLAIMER =
  "Mint date and price are not final. Nothing here is financial advice.";
