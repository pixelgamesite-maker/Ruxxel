import { createHttpApi } from "./http";
import { createMockApi } from "./mock";
import type { ClaimApi } from "./types";

const base = import.meta.env.VITE_CLAIM_API_URL;
const mock = import.meta.env.VITE_CLAIM_MOCK === "1";

/** True when the claim page is wired to a backend (or the demo mock). */
export const claimMode: "live" | "mock" | "off" = base ? "live" : mock ? "mock" : "off";

export const claimApi: ClaimApi | null =
  claimMode === "live" ? createHttpApi(base as string) : claimMode === "mock" ? createMockApi() : null;

export * from "./types";
