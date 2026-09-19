/**
 * Sample dataset for the Research Lab.
 *
 * Everything here is illustrative and generated locally so the interface can be
 * demoed without a backend. Swap `ASSETS` for your indexer / pricing feed and
 * the components will render live data unchanged.
 */

export type AssetClass = "Equity" | "Treasury" | "Commodity" | "Fund" | "Private";

export type Asset = {
  symbol: string;
  name: string;
  cls: AssetClass;
  sector: string;
  price: number;
  change24h: number;
  change30d: number;
  vol30d: number;
  marketCap: string;
  liquidity: string;
  holders: number;
  onchain24h: string;
  risk: { liquidity: number; volatility: number; concentration: number; custody: number };
  correlations: { symbol: string; r: number }[];
  flows: { t: string; x: string }[];
  events: { t: string; x: string }[];
  summary: string;
  driver: string;
  series: number[];
};

/** Deterministic walk so charts are stable between renders. */
function walk(seed: number, start: number, drift: number, noise: number, n = 90): number[] {
  let s = seed;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff - 0.5);
  const out: number[] = [];
  let v = start;
  for (let i = 0; i < n; i++) {
    v = v * (1 + drift / n + rnd() * noise);
    out.push(Number(v.toFixed(4)));
  }
  return out;
}

export const ASSETS: Asset[] = [
  {
    symbol: "AAPLx",
    name: "Apple Inc.",
    cls: "Equity",
    sector: "Technology",
    price: 241.88,
    change24h: 1.42,
    change30d: 6.1,
    vol30d: 23.4,
    marketCap: "$18.4M",
    liquidity: "$2.1M",
    holders: 4127,
    onchain24h: "$684K",
    risk: { liquidity: 28, volatility: 41, concentration: 34, custody: 22 },
    correlations: [
      { symbol: "NVDAx", r: 0.71 },
      { symbol: "MSFTx", r: 0.83 },
      { symbol: "SPYx", r: 0.88 },
      { symbol: "GOLDx", r: -0.12 },
    ],
    flows: [
      { t: "12m", x: "**41 transfers** in the last hour, 2.3× the weekly average" },
      { t: "3h", x: "Top holder share fell to **8.4%** after a 12K unit distribution" },
      { t: "9h", x: "New liquidity pool opened, depth now **$2.1M**" },
    ],
    events: [
      { t: "2d", x: "Quarterly results beat consensus on services revenue" },
      { t: "6d", x: "Issuer expanded redemption window to daily settlement" },
    ],
    summary:
      "AAPLx tracks Apple common stock with daily redemption. The last month's move is led by the underlying equity rather than anything onchain: transfer volume is normal for the size of the float, and holder concentration has fallen slightly.",
    driver: "Underlying equity re-rating after earnings",
    series: walk(11, 228, 0.061, 0.011),
  },
  {
    symbol: "NVDAx",
    name: "NVIDIA Corp.",
    cls: "Equity",
    sector: "Semiconductors",
    price: 188.4,
    change24h: -2.84,
    change30d: 14.7,
    vol30d: 48.9,
    marketCap: "$24.9M",
    liquidity: "$3.4M",
    holders: 6892,
    onchain24h: "$1.9M",
    risk: { liquidity: 21, volatility: 78, concentration: 39, custody: 22 },
    correlations: [
      { symbol: "AAPLx", r: 0.71 },
      { symbol: "SPYx", r: 0.74 },
      { symbol: "TBILx", r: -0.31 },
      { symbol: "GOLDx", r: 0.04 },
    ],
    flows: [
      { t: "38m", x: "Sell-side transfers **3.1×** the 30-day average" },
      { t: "2h", x: "Two wallets moved **18.4K units** into the main pool" },
      { t: "7h", x: "Holder count up **212** over 24 hours" },
    ],
    events: [
      { t: "1d", x: "Sector-wide drawdown on supply chain commentary" },
      { t: "4d", x: "Added to the chain's index basket" },
    ],
    summary:
      "The most volatile asset in coverage. Today's drop is broad sector weakness, but onchain selling is running well above normal, which usually widens spreads for a few hours after a move like this.",
    driver: "Sector drawdown plus above-average onchain selling",
    series: walk(29, 162, 0.148, 0.021),
  },
  {
    symbol: "TBILx",
    name: "3-Month T-Bill Note",
    cls: "Treasury",
    sector: "Government debt",
    price: 100.42,
    change24h: 0.01,
    change30d: 0.36,
    vol30d: 0.8,
    marketCap: "$41.2M",
    liquidity: "$6.8M",
    holders: 2310,
    onchain24h: "$412K",
    risk: { liquidity: 12, volatility: 4, concentration: 52, custody: 18 },
    correlations: [
      { symbol: "GOLDx", r: 0.18 },
      { symbol: "NVDAx", r: -0.31 },
      { symbol: "SPYx", r: -0.22 },
      { symbol: "REITx", r: -0.09 },
    ],
    flows: [
      { t: "1h", x: "Steady accumulation, **+$180K** net inflow today" },
      { t: "5h", x: "Largest holder still controls **14.2%** of supply" },
    ],
    events: [
      { t: "3d", x: "Yield reset to 4.31% on the new issue" },
      { t: "11d", x: "Attestation published for the underlying holdings" },
    ],
    summary:
      "The lowest-volatility asset in coverage and the one most portfolios use as ballast. The only meaningful risk flag is concentration: a handful of wallets hold a large share of supply.",
    driver: "Coupon accrual, no market-driven move",
    series: walk(7, 100.05, 0.0037, 0.0006),
  },
  {
    symbol: "GOLDx",
    name: "Allocated Gold",
    cls: "Commodity",
    sector: "Precious metals",
    price: 2418.6,
    change24h: 0.74,
    change30d: 3.9,
    vol30d: 12.6,
    marketCap: "$29.7M",
    liquidity: "$4.2M",
    holders: 3845,
    onchain24h: "$820K",
    risk: { liquidity: 24, volatility: 26, concentration: 30, custody: 41 },
    correlations: [
      { symbol: "TBILx", r: 0.18 },
      { symbol: "SPYx", r: -0.06 },
      { symbol: "AAPLx", r: -0.12 },
      { symbol: "OILx", r: 0.22 },
    ],
    flows: [
      { t: "22m", x: "Inflows **+$94K**, third straight day of net buying" },
      { t: "4h", x: "Vault attestation refreshed, **1:1** coverage confirmed" },
    ],
    events: [
      { t: "1d", x: "Rates repricing lifted metals across the board" },
      { t: "8d", x: "New custodian added to the vault network" },
    ],
    summary:
      "Each token is claimed against allocated bars held in custody. Custody is the risk line to watch here rather than volatility, which stays low relative to the equity side of the market.",
    driver: "Rates repricing lifting precious metals",
    series: walk(41, 2330, 0.04, 0.007),
  },
  {
    symbol: "SPYx",
    name: "Broad Market Index",
    cls: "Fund",
    sector: "Diversified equity",
    price: 601.24,
    change24h: -0.38,
    change30d: 2.8,
    vol30d: 15.2,
    marketCap: "$52.8M",
    liquidity: "$9.1M",
    holders: 8204,
    onchain24h: "$2.4M",
    risk: { liquidity: 14, volatility: 22, concentration: 19, custody: 20 },
    correlations: [
      { symbol: "AAPLx", r: 0.88 },
      { symbol: "NVDAx", r: 0.74 },
      { symbol: "REITx", r: 0.51 },
      { symbol: "TBILx", r: -0.22 },
    ],
    flows: [
      { t: "15m", x: "Most-traded asset on the chain today by volume" },
      { t: "6h", x: "Holder base grew **1.9%** week over week" },
    ],
    events: [{ t: "2d", x: "Index rebalance added four constituents" }],
    summary:
      "The default building block for onchain portfolios and the deepest pool in coverage. High correlation with most equity positions, so it tends to duplicate exposure you already hold.",
    driver: "Index-level drift, no single constituent dominant",
    series: walk(63, 585, 0.029, 0.005),
  },
  {
    symbol: "REITx",
    name: "Commercial Property Trust",
    cls: "Fund",
    sector: "Real estate",
    price: 74.18,
    change24h: 2.16,
    change30d: -4.2,
    vol30d: 27.8,
    marketCap: "$11.6M",
    liquidity: "$740K",
    holders: 1482,
    onchain24h: "$188K",
    risk: { liquidity: 64, volatility: 46, concentration: 58, custody: 33 },
    correlations: [
      { symbol: "SPYx", r: 0.51 },
      { symbol: "TBILx", r: -0.09 },
      { symbol: "GOLDx", r: 0.11 },
      { symbol: "AAPLx", r: 0.34 },
    ],
    flows: [
      { t: "48m", x: "Thin book, **$740K** depth against $188K daily volume" },
      { t: "3h", x: "Top five wallets hold **58%** of supply" },
    ],
    events: [
      { t: "5d", x: "Quarterly distribution declared at 1.4%" },
      { t: "14d", x: "Two properties revalued downward in the portfolio" },
    ],
    summary:
      "Small, thinly traded and concentrated. Price moves here are often a single wallet rather than a market view, so treat short-term swings with more caution than the headline percentage suggests.",
    driver: "Low liquidity amplifying a modest buy order",
    series: walk(83, 77.4, -0.043, 0.014),
  },
  {
    symbol: "OILx",
    name: "Crude Benchmark",
    cls: "Commodity",
    sector: "Energy",
    price: 71.92,
    change24h: -1.18,
    change30d: -7.4,
    vol30d: 34.1,
    marketCap: "$8.9M",
    liquidity: "$1.1M",
    holders: 967,
    onchain24h: "$240K",
    risk: { liquidity: 51, volatility: 62, concentration: 44, custody: 29 },
    correlations: [
      { symbol: "GOLDx", r: 0.22 },
      { symbol: "SPYx", r: 0.28 },
      { symbol: "TBILx", r: -0.14 },
      { symbol: "REITx", r: 0.07 },
    ],
    flows: [{ t: "1h", x: "Volume **below** the 30-day average for a fourth session" }],
    events: [{ t: "3d", x: "Inventory build came in above expectations" }],
    summary:
      "Tracks front-month crude with monthly roll. The roll schedule, not spot price, explains most of the gap between this token and the headline oil price you see quoted elsewhere.",
    driver: "Inventory build and an unfavourable monthly roll",
    series: walk(97, 77.6, -0.076, 0.016),
  },
  {
    symbol: "PRVTx",
    name: "Late Stage Growth Fund",
    cls: "Private",
    sector: "Private markets",
    price: 1284.0,
    change24h: 0.0,
    change30d: 8.9,
    vol30d: 9.4,
    marketCap: "$15.3M",
    liquidity: "$310K",
    holders: 412,
    onchain24h: "$46K",
    risk: { liquidity: 82, volatility: 34, concentration: 71, custody: 47 },
    correlations: [
      { symbol: "NVDAx", r: 0.44 },
      { symbol: "SPYx", r: 0.39 },
      { symbol: "TBILx", r: -0.18 },
      { symbol: "GOLDx", r: 0.02 },
    ],
    flows: [{ t: "9h", x: "Only **6 transfers** in 24 hours, typical for this asset" }],
    events: [{ t: "7d", x: "Quarterly mark moved up on a portfolio company round" }],
    summary:
      "Marked quarterly rather than traded continuously, so the flat 24-hour line is expected. Liquidity and concentration are the highest in coverage. Exiting a position of size will take time.",
    driver: "Quarterly revaluation, not market trading",
    series: walk(113, 1180, 0.092, 0.003),
  },
];

export const CLASSES: AssetClass[] = ["Equity", "Treasury", "Commodity", "Fund", "Private"];

/** Illustrative portfolio used by the Commander view. */
export const PORTFOLIO = [
  { symbol: "SPYx", weight: 34 },
  { symbol: "AAPLx", weight: 22 },
  { symbol: "NVDAx", weight: 18 },
  { symbol: "TBILx", weight: 14 },
  { symbol: "GOLDx", weight: 8 },
  { symbol: "REITx", weight: 4 },
];
