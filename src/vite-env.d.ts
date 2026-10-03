/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Base URL of the claim backend. Unset = claim page shows "opens with the mint". */
  readonly VITE_CLAIM_API_URL?: string;
  /** "1" = run the claim page against an in-browser mock (demo / QA only). */
  readonly VITE_CLAIM_MOCK?: string;
  /** "1" = mock processing takes 15s instead of 3 minutes. */
  readonly VITE_CLAIM_MOCK_FAST?: string;
  readonly VITE_OPENSEA_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
