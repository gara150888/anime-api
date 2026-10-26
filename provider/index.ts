import { createProvider, type ProviderRawResult } from "./helpers/create.provider";

export const providers = [
  createProvider({
    name: "toonstream",
    baseUrl: "https://toonstream.us",
    fetchType: "scrap",
    paths: {
      season: "/series/{id}",
      episode: "/episode/{id}",
      movie: "/movie/{id}",
    },
    // Simple GET search can now just be a template string or EndpointConfig
    search: "/search/all?q={id}",
  }),

  createProvider({
    name: "watchanimeworld",
    baseUrl: "https://watchanimeworld.one",
    fetchType: "scrap",
    paths: {
      season: "/series/{id}",
      episode: "/episode/{id}",
      movie: "/movie/{id}",
    },
    // Dynamic POST search with automatic URLSearchParams + form-urlencoded header
    search: {
      url: "/wp-admin/admin-ajax.php",
      method: "POST",
      body: (id) => ({
        action: "action_tr_search_suggest",
        nonce: "0309aa60a7",
        term: id,
      }),
    },
  }),

  createProvider({
    name: "animedekho",
    baseUrl: "https://animedekho.tv",
    fetchType: "scrap", // Pages are HTML ("scrap"), while search below overrides to "api"
    paths: {
      season: "/series-hindi/{id}",
      episode: "/epi/{id}",
      movie: "/movie-hindi/{id}",
    },
    search: {
      url: "/wp-json/dgt/v1/suggest",
      fetchType: "api", // Search returns JSON directly
      query: (id) => ({ q: id }),
    },
  }),

  createProvider({
    name: "desidubanime",
    baseUrl: "https://desidubanime.me",
    fetchType: "scrap",
    paths: {
      season: "/anime/{id}",
      episode: "/episode/{id}",
      movie: "/movie/{id}",
    },
  }),
] as const;

export type ProviderName = (typeof providers)[number]["name"];

/**
 * Admin helper: Search across all providers that support search in one call.
 * Returns raw HTML/JSON per provider ready to pass to your AI organizer & DB schema.
 */
export async function searchAllProviders(query: string): Promise<ProviderRawResult[]> {
  const searchable = providers.filter((p) => Boolean(p.search));

  return Promise.all(
    searchable.map((provider) => {
      const req = provider.getSearchRequest(query);
      return provider.execute(req);
    }),
  );
}

/**
 * Admin helper: Fetch a specific path (season, episode, movie) from a chosen provider.
 */
export async function fetchFromProvider(
  providerName: ProviderName,
  kind: "season" | "episode" | "movie",
  id: string,
): Promise<ProviderRawResult> {
  const provider = providers.find((p) => p.name === providerName);
  if (!provider) throw new Error(`Unknown provider: ${providerName}`);

  const req = provider.getRequest(kind, id);
  return provider.execute(req);
}

export default providers;