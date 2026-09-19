export type CrewMember = {
  id: string;
  name: string;
  role: string;
  world: string;
  short: string;
  long: string;
  reads: string[];
  img: string;
  tone: "cyan" | "purple" | "pink" | "orange" | "green";
};

export const CREW: CrewMember[] = [
  {
    id: "scientist",
    name: "The Scientist",
    role: "Fundamentals",
    world: "Deep water lab",
    short: "Takes an asset apart to see what is actually inside it.",
    long: "Reads what backs the token, who holds the collateral, how redemption works and whether the thing tracks what it says it tracks. Boring questions, expensive answers.",
    reads: ["Backing", "Custody", "Redemption", "Peers"],
    img: "/ruxxel1.png",
    tone: "cyan",
  },
  {
    id: "scout",
    name: "The Scout",
    role: "Discovery",
    world: "Cloud field",
    short: "Finds assets before they hit anyone's watchlist.",
    long: "Watches every new deployment on the chain, throws out the noise, and brings back the handful worth a second look with early liquidity and holder data attached.",
    reads: ["New drops", "First liquidity", "Early holders", "Gaps"],
    img: "/ruxxel2.png",
    tone: "green",
  },
  {
    id: "engineer",
    name: "The Engineer",
    role: "Onchain",
    world: "Frozen station",
    short: "Lives in the transfer logs and likes it there.",
    long: "Tracks flows, holder concentration, contract activity and pool depth. When a wallet cluster starts moving, the Engineer sees it in the block, not in the price.",
    reads: ["Transfers", "Concentration", "Pool depth", "Contracts"],
    img: "/ruxxel3.png",
    tone: "purple",
  },
  {
    id: "trader",
    name: "The Trader",
    role: "Markets",
    world: "Molten field",
    short: "Watches the tape so you can go outside.",
    long: "Price action, realised volatility, spreads, drawdown. Flags when a move is genuinely weird instead of just telling you that a number went down.",
    reads: ["Range", "Volatility", "Spread", "Drawdown"],
    img: "/ruxxel4.png",
    tone: "orange",
  },
  {
    id: "commander",
    name: "The Commander",
    role: "Portfolio",
    world: "Orbital deck",
    short: "Puts the whole picture together and says the quiet part.",
    long: "Rolls every holding into one view: allocation, overlap, correlation, concentration. Then names the single position doing most of the damage to your risk.",
    reads: ["Allocation", "Correlation", "Concentration", "Risk"],
    img: "/ruxxel5.png",
    tone: "pink",
  },
];
