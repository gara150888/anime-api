import { HeaderGenerator } from "header-generator";

export const profiles = [
  /* windows */ { operatingSystems: ["windows"], devices: ["desktop"], browsers: ["chrome"] },
  /* windows */ { operatingSystems: ["windows"], devices: ["desktop"], browsers: ["firefox"] },
  /* android */ { operatingSystems: ["android"], devices: ["mobile"], browsers: ["chrome"] },
  /* android */ { operatingSystems: ["android"], devices: ["mobile"], browsers: ["firefox"] },
  /* macos   */ { operatingSystems: ["macos"], devices: ["desktop"], browsers: ["safari"] },
  /* ios     */ { operatingSystems: ["ios"], devices: ["mobile"], browsers: ["safari"] },
] as const;

export const profile = profiles[Math.floor(Math.random() * profiles.length)];

export const headers = new HeaderGenerator({
  operatingSystems: [...(profile?.operatingSystems ?? [])],
  devices: [...(profile?.devices ?? [])],
  browsers: [...(profile?.browsers ?? [])],
}).getHeaders();

export { Provider } from "./provider";
export { providers } from "./providers";
export type { SearchResult, SearchConfig } from "./types";
