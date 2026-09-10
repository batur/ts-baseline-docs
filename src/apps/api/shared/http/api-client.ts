import type { ApiErrorEnvelope } from "./envelope.js";
import type { HttpMethod } from "./http-types.js";

export interface JsonApiClientOptions {
  readonly baseUrl: string;
  readonly fetcher?: typeof globalThis.fetch;
}

export interface JsonApiRequest<TBody> {
  readonly body?: TBody;
  readonly headers?: Readonly<Record<string, string>>;
  readonly method: HttpMethod;
  readonly path: string;
  readonly query?: Readonly<Record<string, string | number | undefined>>;
}

export class JsonApiClient {
  readonly #baseUrl: string;
  readonly #fetcher: typeof globalThis.fetch;

  public constructor(options: JsonApiClientOptions) {
    this.#baseUrl = options.baseUrl.replace(/\/$/u, "");
    this.#fetcher = options.fetcher ?? globalThis.fetch;
  }

  public async request<TResponse, TBody = unknown>(
    request: JsonApiRequest<TBody>,
  ): Promise<TResponse> {
    const requestInit: RequestInit = {
      headers: {
        "content-type": "application/json",
        ...request.headers,
      },
      method: request.method,
    };

    if (request.body !== undefined) {
      requestInit.body = JSON.stringify(request.body);
    }

    const response = await this.#fetcher(this.#createUrl(request.path, request.query), requestInit);

    const payload = (await response.json()) as TResponse | ApiErrorEnvelope;

    if (!response.ok) {
      throw new Error(isApiErrorEnvelope(payload) ? payload.error.message : "API request failed.");
    }

    return payload as TResponse;
  }

  #createUrl(path: string, query: JsonApiRequest<unknown>["query"]): string {
    const url = new URL(`${this.#baseUrl}${path}`);

    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }

    return url.toString();
  }
}

function isApiErrorEnvelope(value: unknown): value is ApiErrorEnvelope {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "object" &&
    value.error !== null &&
    "message" in value.error &&
    typeof value.error.message === "string"
  );
}
