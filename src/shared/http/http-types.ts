export const API_VERSION_PREFIX = "/api/v1";

export type HttpMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

export type HttpStatusCode =
  | 200
  | 201
  | 400
  | 401
  | 403
  | 404
  | 409
  | 412
  | 415
  | 422
  | 429
  | 500
  | 502
  | 503
  | 504;

export interface ApiRequest<
  TBody = unknown,
  TQuery = Readonly<Record<string, string | undefined>>,
> {
  readonly body: TBody;
  readonly headers: Readonly<Record<string, string | undefined>>;
  readonly query: TQuery;
  readonly requestId: string;
}
