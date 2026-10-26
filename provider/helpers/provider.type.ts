export type FetchType = "scrap" | "api";

export type DynamicValue<T = string> = string | ((id: string) => T);

export type EndpointConfig = {
  url: DynamicValue<string>;
  method?: "GET" | "POST";
  fetchType?: FetchType;
  headers?: Record<string, string>;
  query?: (id: string) => string | Record<string, string> | URLSearchParams;
  body?: (id: string) => BodyInit | Record<string, string> | URLSearchParams;
};

export type EndpointInput = DynamicValue<string> | EndpointConfig;

export type ProviderConfig<P extends Record<string, EndpointInput>> = {
  name: string;
  baseUrl: string;
  fetchType?: FetchType;
  headers?: Record<string, string>;
  paths: P;
  search?: EndpointInput;
};

export type ProviderRequest = {
  provider: string;
  kind: string;
  fetchType: FetchType;
  url: string;
  init: RequestInit;
};

export type ProviderRawResult = {
  provider: string;
  kind: string;
  fetchType: FetchType;
  url: string;
  ok: boolean;
  status: number;
  data: unknown; // Raw HTML string for "scrap" or parsed JSON for "api"
  error?: string;
};