import type { SearchConfig, SearchResult } from "../types";

export class Provider {
  constructor(
    public name: string,
    public baseUrl: string,
    public fetchType: "scrap" | "api",
    public paths: {
      season: string;
      episode: string;
      movie: string;
    },
    public search: SearchConfig,
  ) { }

  getRequests(kind: keyof Provider["paths"], id: string) {
    return `${this.baseUrl}${this.paths[kind].replace("{id}", id)}`;
  }

  getSearchRequest(id: string) {
    const { action, url, method, headers, query } = this.search;
    const baseUrl = `${this.baseUrl}${url}`;
    const params = query(id);

    return {
      action,
      method,
      url: method === "GET" ? `${baseUrl}${params}` : baseUrl,
      headers,
      ...(method === "POST" ? { body: params } : {}),
    };
  }

  extractSearchResults(data: string): SearchResult[] {
    const { searchRegex, mapResult } = this.search;
    const regex = new RegExp(searchRegex.source, searchRegex.flags);

    return Array.from(data.matchAll(regex)).flatMap((match) => {
      const result = mapResult(match);
      return result ? [{ provider: this.name, ...result }] : [];
    });
  }
}
