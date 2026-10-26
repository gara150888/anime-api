export type SearchResult = {
  provider: string;
  title: string;
  type: string;
  url: string;
};

export type SearchConfig = {
  action: string;
  url: string;
  method: "GET" | "POST";
  headers?: Record<string, string>;
  query: (id: string) => string;
  searchRegex: RegExp;
  mapResult: (
    match: RegExpMatchArray,
  ) => Omit<SearchResult, "provider"> | null;
};
