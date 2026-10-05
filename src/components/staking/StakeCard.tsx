import { useEffect, useState } from "react";
import { POINTS_PER_DAY, timeLeft } from "@/lib/stakingContract";

export type StakeCardData = {
  id: string;
  image: string | null;
  /** unix seconds */
  start: number;
  unlock: number;
};

const DAY = 86_400;

function useNow(ms: number) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

/** One staked Ruxxell: art, lock, live mined counter, unstake. */
export default function StakeCard({ stake, busy, onUnstake }: { stake: StakeCardData; busy: boolean; onUnstake: () => void }) {
  const now = useNow(1000);
  const lockDays = Math.round((stake.unlock - stake.start) / DAY);
  const unlocked = now >= stake.unlock;
  const left = timeLeft(stake.unlock, now);

  // Mirrors the contract: accrual stops at the unlock time.
  const elapsed = Math.max(0, Math.min(now, stake.unlock) - stake.start);
  const mined = (elapsed * POINTS_PER_DAY) / DAY;
  const progress = Math.min(100, Math.round(((now - stake.start) / (stake.unlock - stake.start)) * 100));

  return (
    <article className="stakecard" data-unlocked={unlocked}>
      <span className="frame scan stakecard__art">
        {stake.image ? (
          <img src={stake.image} alt={`Ruxxell #${stake.id}`} loading="lazy" decoding="async" draggable={false} />
        ) : (
          <span className="placeholder">#{stake.id}</span>
        )}
      </span>

      <div className="stakecard__main">
        <h3 className="stakecard__name px">RUXX #{stake.id}</h3>
        <div className="stakecard__pills">
          <span className="pill">{lockDays} days</span>
          <span className={`pill ${unlocked ? "pill--lime" : ""}`}>{unlocked ? "Unlocked" : `${left} left`}</span>
        </div>
        <div className="stakecard__bar" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>

      <dl className="stakecard__stats">
        <div>
          <dt>Earning</dt>
          <dd>{POINTS_PER_DAY} / day</dd>
        </div>
        <div>
          <dt>Mined</dt>
          <dd className="stakecard__mined">{mined.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
        </div>
      </dl>

      <button type="button" className={`btn btn--sm ${unlocked ? "btn--lime" : "btn--ghost"}`} disabled={busy || !unlocked} onClick={onUnstake}>
        {unlocked ? "Unstake" : `Locked · ${left}`}
      </button>
    </article>
  );
}
