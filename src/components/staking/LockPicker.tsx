import { LOCK_DAYS, POINTS_PER_DAY } from "@/lib/stakingContract";

/** Four lock tiles. Rate is flat, so each tile shows the total mined per NFT. */
export default function LockPicker({ value, onChange }: { value: number; onChange: (days: number) => void }) {
  return (
    <div className="lockpick" role="radiogroup" aria-label="Lock length">
      {LOCK_DAYS.map((d) => {
        const on = value === d;
        return (
          <button key={d} type="button" role="radio" aria-checked={on} className="lockpick__tile" data-on={on} onClick={() => onChange(d)}>
            <span className="lockpick__days px">{d} DAYS</span>
            <span className="lockpick__pts">{(d * POINTS_PER_DAY).toLocaleString()} pts / NFT</span>
          </button>
        );
      })}
    </div>
  );
}
