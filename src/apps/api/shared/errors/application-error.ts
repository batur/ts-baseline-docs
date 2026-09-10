import type { ApiErrorDetail, HttpStatusCode } from "../http/index.js";

export interface ApplicationErrorOptions {
  readonly details?: readonly ApiErrorDetail[];
  readonly status?: HttpStatusCode;
}

export class ApplicationError extends Error {
  public constructor(
    message: string,
    public readonly code: string,
    options: ApplicationErrorOptions = {},
  ) {
    super(message);
    this.name = "ApplicationError";
    this.details = options.details;
    this.status = options.status ?? 500;
  }

  public readonly details: readonly ApiErrorDetail[] | undefined;
  public readonly status: HttpStatusCode;
}
