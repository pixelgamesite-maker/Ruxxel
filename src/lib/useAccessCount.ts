import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * How many wallets are on the list. Reads the count-only `access_count()`
 * function (supabase/schema.sql), so the anon key never needs read access to
 * the applications table itself. Null until it loads or if it is not set up.
 */
export function useAccessCount(): number | null {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    supabase.rpc("access_count").then(({ data, error }) => {
      if (alive && !error && typeof data === "number") setCount(data);
    });
    return () => {
      alive = false;
    };
  }, []);

  return count;
}
