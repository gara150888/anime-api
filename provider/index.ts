import { request } from "undici";
import { headers } from "../helpers";

export const providers = [


  {
    name: "toonstream",
    baseUrl: "https://toonstream.us",
    fetchType: "scrap",
    paths: {
      series: "/series/",
      episode: "/episode/",
      movie: "/movie/",
    },
    search: (id: string) => `/search/all?q=${id}`,
    async searchQuery(id: string) {

      const { body, statusCode } = await request(`${this.baseUrl}${this.search(id)}`, {
        headers: { ...headers, Referer: this.baseUrl },
      })

      if (statusCode !== 200) return {
        status: statusCode,
        provider: this.name,
        message: "error",
      };

      const res = await body.json();

      return {
        status: statusCode,
        provider: this.name,
        results: ((res) as {
          data?: { title: string; type: string; url: string }[]
        }).data?.map(({ url, type, title }) => ({
          id: url.split("/").filter(Boolean).pop()!,
          type: type,
          title,
        })) ?? [],
      };
    }
  },

  {
    name: "watchanimeworld",
    baseUrl: "https://watchanimeworld.one",
    fetchType: "scrap",
    paths: {
      series: "/series/",
      episode: "/episode/",
      movie: "/movies/",
    },
    search: {
      url: "/wp-admin/admin-ajax.php",
      method: "POST",
      body: (id: string) => ({
        action: "action_tr_search_suggest",
        nonce: "0309aa60a7",
        term: id,
      }),
    },

    async searchQuery(id: string) {
      const { body, statusCode } = await request(`${this.baseUrl}${this.search.url}`, {
        method: this.search.method,
        headers: { ...headers, Referer: this.baseUrl, "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(this.search.body(id)).toString(),
      });

      if (statusCode !== 200) return {
        status: statusCode,
        provider: this.name,
        message: "error",
      };

      const results = [...(await body.text())
        .matchAll(/<li class="fa-play-circle">\s*<a href="([^"]+)"><span class="type-([^"]+)">[^<]*<\/span>(.*?)<\/a>\s*<\/li>/g)]
        .flatMap(([, url, type, title]) => url && type && title ? [{
          id: url
            .replace(this.baseUrl, "")
            .replace((this.paths[type as keyof typeof this.paths] as string), "")
            .split("/").reverse()[1],
          type: type === "movies" ? "movie" : type,
          title: title.trim()
        }] : []);

      return { status: statusCode, provider: this.name, results };
    }

  }
] as const

export default providers;