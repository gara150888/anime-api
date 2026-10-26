import { Provider } from "../provider";

export const providers = [
  new Provider(
    "watchanimeworld",
    "https://watchanimeworld.one",
    "scrap",
    {
      season: "/series/{id}",
      episode: "/episode/{id}",
      movie: "/movie/{id}",
    },
    {
      action: "search",
      url: "/wp-admin/admin-ajax.php",
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        referer: "https://watchanimeworld.one/",
      },
      query: (id) => new URLSearchParams({ action: "action_tr_search_suggest", nonce: "0309aa60a7", term: id, }).toString(),
      searchRegex: /<a href="([^"]+)"[^>]*>\s*<span class="type-([^"]+)">([^<]+)<\/span>(.*?)<\/a>/g,
      mapResult: (match) => {
        const [, url, , type, title] = match;
        return url && type && title ? { url, type: type.trim(), title: title.trim() } : null;
      },
    },
  ),

  new Provider(
    "toonstream",
    "https://toonstream.us",
    "scrap",
    {
      season: "/series/{id}",
      episode: "/episode/{id}",
      movie: "/movie/{id}",
    },
    {
      action: "search",
      url: "/search/all",
      method: "GET",
      headers: { referer: "https://toonstream.us/" },
      query: (id) => `?q=${encodeURIComponent(id)}`,
      searchRegex: /"title"\s*:\s*"([^"]+)"\s*,\s*"type"\s*:\s*"([^"]+)"\s*,\s*"url"\s*:\s*"([^"]+)"/g,
      mapResult: (match) => {
        const [, title, type, url] = match;
        return title && type && url ? { title, type, url } : null;
      },
    },
  ),
] as const;
