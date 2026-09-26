import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL ?? "";
const key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

/** False until both env vars are set. The app still runs without them. */
export const supabaseReady = Boolean(url && key);

/** Created lazily so a missing .env never breaks the page at import time. */
export const supabase: SupabaseClient | null = supabaseReady ? createClient(url, key) : null;

/**
 * Table the access list writes to. See the SQL file for schema and the
 * insert-only RLS policy for the anon role.
 */
export const ACCESS_TABLE = "ruxxells";
