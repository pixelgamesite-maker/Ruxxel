import { BOARD } from "@/data/board";
import { ArrowUpRight } from "@/components/ui/Icons";
import { useBoard } from "@/lib/board";
import { fmtPct, fmtPrice, fmtUsdCompact } from "@/lib/format";

export default function Board() {
  const quotes = useBoard();

  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="col">
        <div className="board__head">
          <span className="tag live">Live</span>
          <h2 className="display h-lg">The Board</h2>
          <p className="lede">
            What the crew is watching. Prices are live from the open market and refresh on their own.
          </p>
        </div>

        <div className="board__rows">
          {BOARD.map((t) => {
            const q = quotes[t.symbol];
            const href = q?.url ?? `https://dexscreener.com/search?q=${encodeURIComponent(t.address)}`;
            return (
              <a className="row" key={t.symbol} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${t.name} on DexScreener`}>
                <div>
                  <span className="row__sym">{t.symbol}</span>
                  <span className="row__name">{t.name}</span>
                </div>
                <dl className="cell cell--vol">
                  <dt>24H Vol</dt>
                  <dd>{q ? fmtUsdCompact(q.volume24h) : "—"}</dd>
                </dl>
                <dl className="cell cell--liq">
                  <dt>Liquidity</dt>
                  <dd>{q ? fmtUsdCompact(q.liquidity) : "—"}</dd>
                </dl>
                <dl className="cell cell--price">
                  <dt className="sr">Price</dt>
                  <dd>{q ? fmtPrice(q.price) : "—"}</dd>
                  <small className={!q ? "na" : q.change24h < 0 ? "dn" : undefined}>
                    {q ? fmtPct(q.change24h) : "—"}
                  </small>
                </dl>
                <span className="row__go">
                  <ArrowUpRight size={16} />
                </span>
              </a>
            );
          })}
        </div>

        <p className="board__note">
          Prices are indicative and come from the open market. Nothing here is advice, an offer, or
          connected to the mint.
        </p>
      </div>
    </section>
  );
}
