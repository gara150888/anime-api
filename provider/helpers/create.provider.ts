import type { BodyInit } from "undici-types/fetch";
import {
  type DynamicValue,
  type EndpointInput,
  type ProviderConfig,
  type ProviderRawResult,
  type ProviderRequest,
} from "./provider.type";


function resolvePath(templateOrFn: DynamicValue<string>, id: string): string {
  const encoded = encodeURIComponent(id);
  return typeof templateOrFn === "function"
    ? templateOrFn(encoded)
    : templateOrFn.replaceAll("{id}", encoded);
}

function serializeParams(
  value: string | Record<string, string> | URLSearchParams,
): string {
  if (typeof value === "string") return value;
  if (value instanceof URLSearchParams) return value.toString();
  return new URLSearchParams(value).toString();
}

export function createProvider<const P extends Record<string, EndpointInput>>(
  config: ProviderConfig<P>,
) {

  const {
    name,
    baseUrl,
    fetchType: defaultFetchType = "scrap",
    headers: defaultHeaders,
    paths,
    search,
  } = config;

  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");

  function buildRequest(
    kind: string,
    endpoint: EndpointInput,
    id: string,
  ): ProviderRequest {

    const isSimple = typeof endpoint === "string" || typeof endpoint === "function";
    const method = isSimple ? "GET" : (endpoint.method ?? "GET");
    const fetchType = isSimple
      ? defaultFetchType
      : (endpoint.fetchType ?? defaultFetchType);

    const rawPath = resolvePath(isSimple ? endpoint : endpoint.url, id);
    let fullUrl = `${normalizedBaseUrl}${rawPath}`;

    if (!isSimple && endpoint.query) {
      const qs = serializeParams(endpoint.query(id));
      if (qs) fullUrl += qs.startsWith("?") ? qs : `?${qs}`;
    }

    const headers: Record<string, string> = {
      referer: `${normalizedBaseUrl}/`,
      ...defaultHeaders,
      ...(!isSimple ? endpoint.headers : {}),
    };

    let body: BodyInit | undefined;
    if (!isSimple && method === "POST") {
      const rawBody = endpoint.body
        ? endpoint.body(id)
        : endpoint.query
          ? endpoint.query(id)
          : undefined;

      if (rawBody !== undefined) {
        if (
          typeof rawBody === "object" &&
          !(rawBody instanceof URLSearchParams) &&
          !(rawBody instanceof FormData) &&
          !(rawBody instanceof Blob) &&
          !(rawBody instanceof ArrayBuffer)
        ) {
          body = new URLSearchParams(
            rawBody as Record<string, string>,
          ).toString();
          headers["content-type"] ??=
            "application/x-www-form-urlencoded; charset=UTF-8";
        } else if (rawBody instanceof URLSearchParams) {
          body = rawBody.toString();
          headers["content-type"] ??=
            "application/x-www-form-urlencoded; charset=UTF-8";
        } else {
          body = rawBody;
        }
      }
    }

    return {
      provider: name,
      kind,
      fetchType,
      url: fullUrl,
      init: {
        method,
        headers,
        ...(body !== undefined ? { body } : {}),
      },
    };
  }

  return {
    ...config,
    fetchType: defaultFetchType,

    /** Build a request config (URL + fetch init) for any path key (season, episode, movie, etc.) */
    getRequest<K extends keyof P & string>(
      kind: K,
      id: string,
    ): ProviderRequest {
      const endpoint = paths[kind];
      if (!endpoint) {
        throw new Error(`Path "${kind}" is not configured for ${name}`);
      }
      return buildRequest(kind, endpoint, id);
    },

    /** Build a search request config for this provider */
    getSearchRequest(query: string): ProviderRequest {
      if (!search) {
        throw new Error(`Search is not supported by ${name}`);
      }
      return buildRequest("search", search, query);
    },

    /** Execute a built request and return raw HTML (for "scrap") or JSON (for "api") */
    async execute(req: ProviderRequest): Promise<ProviderRawResult> {
      try {
        const res = await fetch(req.url, req.init);
        const data =
          req.fetchType === "api" ? await res.json() : await res.text();

        return {
          provider: req.provider,
          kind: req.kind,
          fetchType: req.fetchType,
          url: req.url,
          ok: res.ok,
          status: res.status,
          data,
        };
      } catch (err) {
        return {
          provider: req.provider,
          kind: req.kind,
          fetchType: req.fetchType,
          url: req.url,
          ok: false,
          status: 0,
          data: null,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    },
  };
}

export type { ProviderRawResult };
