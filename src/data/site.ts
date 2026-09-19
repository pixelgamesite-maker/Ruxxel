/** Brand + site-wide constants. Edit copy here, not in components. */

export const BRAND = {
  name: "Ruxxells",
  tagline: "Your onchain research crew",
  chain: "Robinhood Chain",
  x: "https://x.com/ruxxellsHQ",
  handle: "@ruxxellsHQ",
};

export const COLLECTION = {
  supply: 1970,
  supplyLabel: "1,970",
  mintPrice: "TBA",
  chain: "Robinhood Chain",
  status: "Contract not yet deployed",
};

/** Pixel art lives in /public as ruxxel1.png ... ruxxel20.png */
export const PIXELS = Array.from({ length: 20 }, (_, i) => `/ruxxel${i + 1}.png`);
export const MOTION = ["/ruxxel1.gif", "/ruxxel2.gif"];

/** The Lab, presented like an app's product shelf. */
export const LAB_CARDS = [
  {
    id: "assets",
    name: "Asset Files",
    tone: "green",
    art: "/ruxxel6.png",
    status: "Try it",
    blurb: "Every tokenized asset, opened up. Price, risk, flows, and what actually moved it.",
  },
  {
    id: "compare",
    name: "Face Off",
    tone: "cyan",
    art: "/ruxxel7.png",
    status: "Try it",
    blurb: "Four assets, one axis. Rebased so a $2,400 gold token and a $100 note line up.",
  },
  {
    id: "portfolio",
    name: "War Room",
    tone: "pink",
    art: "/ruxxel8.png",
    status: "Try it",
    blurb: "Your whole bag in one view. Overlap, concentration, and what is really driving risk.",
  },
  {
    id: "alerts",
    name: "The Siren",
    tone: "orange",
    art: "/ruxxel9.png",
    status: "Try it",
    blurb: "Tell the crew what matters. They shout when it happens and stay quiet when it does not.",
  },
];

export const STEPS = [
  { k: "Find it", d: "New tokenized assets, the moment they land." },
  { k: "Read it", d: "Fundamentals, market data and onchain flows in one card." },
  { k: "Stack it", d: "Compare against anything else on the chain." },
  { k: "Watch it", d: "Alerts for the moves you actually care about." },
];

export const ROADMAP = [
  { k: "Now", t: "Access list", d: "Four steps. Applications get read by a human, not a bot." },
  { k: "Next", t: "Lab beta", d: "Asset files, war room and alerts open to access list wallets." },
  { k: "Then", t: "Mint", d: `${COLLECTION.supplyLabel} Ruxxells on ${COLLECTION.chain}. Price announced first on X.` },
  { k: "After", t: "Reveal", d: "Roles, worlds and traits go live. Your crew shapes your lab." },
  { k: "Later", t: "Ask anything", d: "Plain language questions, answered from real market and chain data." },
  { k: "Eventually", t: "The whole chain", d: "Coverage grows as fast as things get tokenized." },
];

export const FAQS = [
  {
    q: "So what is this?",
    a: "An NFT collection that is also a research app. 1,970 Ruxxells, each one a researcher with a job. Hold one, get the full lab.",
  },
  {
    q: "What does the lab actually do?",
    a: "It reads tokenized real-world assets - stocks, treasuries, gold, funds - and tells you what moved, why, and what it means for the rest of your bag.",
  },
  { q: "What is the supply?", a: `${COLLECTION.supplyLabel}. That is it, forever.` },
  { q: "Mint price?", a: "TBA. Get on the access list and you will hear it first." },
  { q: "Which chain?", a: `${COLLECTION.chain}.` },
  {
    q: "Do I need one to use the lab?",
    a: "Basic research stays open. Holders get unlimited alerts, the war room, full history and a vote on what gets covered next.",
  },
  { q: "How do I get on the list?", a: "Four steps on the Mint tab. Applications are reviewed, not first come first served." },
  {
    q: "Is this financial advice?",
    a: "Absolutely not. The crew explains what the data shows. What you do next is on you.",
  },
];

export const DISCLAIMER =
  "Mint date and price are not final. Data shown in this app is sample data. Nothing here is financial advice.";
