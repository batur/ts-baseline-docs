import type { HttpStatusCode } from "./http-types.js";

export interface ApiMeta {
  readonly requestId: string;
}

export interface ApiPagination {
  readonly hasNextPage: boolean;
  readonly limit: number;
  readonly nextCursor: string | null;
}

export interface ApiSuccessEnvelope<TData> {
  readonly data: TData;
  readonly meta: ApiMeta;
}

export interface ApiCollectionEnvelope<TData> {
  readonly data: readonly TData[];
  readonly meta: ApiMeta;
  readonly pagination: ApiPagination;
}

export interface ApiErrorDetail {
  readonly code: string;
  readonly field: string;
  readonly message: string;
}

export interface ApiErrorEnvelope {
  readonly error: {
    readonly code: string;
    readonly details?: readonly ApiErrorDetail[];
    readonly message: string;
    readonly requestId: string;
  };
}

export interface ApiResponse<TBody> {
  readonly body: TBody;
  readonly headers: Readonly<Record<string, string>>;
  readonly status: HttpStatusCode;
}

export function createSuccessEnvelope<TData>(
  data: TData,
  requestId: string,
): ApiSuccessEnvelope<TData> {
  return {
    data,
    meta: {
      requestId,
    },
  };
}

export function createCollectionEnvelope<TData>(
  data: readonly TData[],
  pagination: ApiPagination,
  requestId: string,
): ApiCollectionEnvelope<TData> {
  return {
    data,
    meta: {
      requestId,
    },
    pagination,
  };
}

export function createErrorEnvelope(
  code: string,
  message: string,
  requestId: string,
  details?: readonly ApiErrorDetail[],
): ApiErrorEnvelope {
  return {
    error: {
      code,
      ...(details === undefined ? {} : { details }),
      message,
      requestId,
    },
  };
}

export function createJsonResponse<TBody>(status: HttpStatusCode, body: TBody): ApiResponse<TBody> {
  return {
    body,
    headers: {
      "content-type": "application/json",
    },
    status,
  };
}
