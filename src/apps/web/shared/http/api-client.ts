export type HttpMethod = "GET" | "POST";

export interface ApiRequestOptions {
  readonly body?: unknown;
  readonly method: HttpMethod;
  readonly path: string;
  readonly query?: Readonly<Record<string, number | string | undefined>>;
}

export interface ApiClientOptions {
  readonly baseUrl: string;
  readonly fetcher?: typeof globalThis.fetch;
}

export class ApiClientError extends Error {
  public constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export class ApiClient {
  readonly #baseUrl: string;
  readonly #fetcher: typeof globalThis.fetch;

  public constructor(options: ApiClientOptions) {
    this.#baseUrl = options.baseUrl.replace(/\/$/u, "");
    this.#fetcher = options.fetcher ?? globalThis.fetch;
  }

  public async request(options: ApiRequestOptions): Promise<unknown> {
    const requestInit: RequestInit = {
      headers: {
        "content-type": "application/json",
      },
      method: options.method,
    };

    if (options.body !== undefined) {
      requestInit.body = JSON.stringify(options.body);
    }

    const response = await this.#fetcher(this.#createUrl(options.path, options.query), requestInit);
    const payload: unknown = await response.json();

    if (!response.ok) {
      throw new ApiClientError(getErrorMessage(payload), response.status);
    }

    return payload;
  }

  #createUrl(path: string, query: ApiRequestOptions["query"]): string {
    const origin = typeof window === "undefined" ? "http://localhost" : window.location.origin;
    const url = new URL(`${this.#baseUrl}${path.startsWith("/") ? path : `/${path}`}`, origin);

    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }

    return this.#baseUrl.startsWith("http") ? url.toString() : `${url.pathname}${url.search}`;
  }
}

function getErrorMessage(payload: unknown): string {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "object" &&
    payload.error !== null &&
    "message" in payload.error &&
    typeof payload.error.message === "string"
  ) {
    return payload.error.message;
  }

  return "API request failed.";
}
