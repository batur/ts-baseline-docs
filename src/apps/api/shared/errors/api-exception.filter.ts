import { Catch, HttpException } from "@nestjs/common";

import { createErrorEnvelope } from "../http/index.js";

import { ApplicationError } from "./application-error.js";

import type { ApiErrorDetail, HttpStatusCode, RequestWithId } from "../http/index.js";
import type { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import type { Response } from "express";

interface MappedError {
  readonly code: string;
  readonly details?: readonly ApiErrorDetail[];
  readonly message: string;
  readonly status: HttpStatusCode;
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  public catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<RequestWithId>();
    const mappedError = mapException(exception);

    response
      .status(mappedError.status)
      .json(
        createErrorEnvelope(
          mappedError.code,
          mappedError.message,
          request.requestId,
          mappedError.details,
        ),
      );
  }
}

function mapException(exception: unknown): MappedError {
  if (exception instanceof ApplicationError) {
    return {
      code: exception.code,
      ...(exception.details === undefined ? {} : { details: exception.details }),
      message: exception.message,
      status: exception.status,
    };
  }

  if (exception instanceof HttpException) {
    const status = toHttpStatusCode(exception.getStatus());

    return {
      code: status === 400 ? "VALIDATION_ERROR" : "HTTP_ERROR",
      message: status >= 500 ? "Internal server error." : "Request failed.",
      status,
    };
  }

  return {
    code: "INTERNAL_ERROR",
    message: "Internal server error.",
    status: 500,
  };
}

function toHttpStatusCode(status: number): HttpStatusCode {
  const supportedStatusCodes: readonly HttpStatusCode[] = [
    400, 401, 403, 404, 409, 412, 415, 422, 429, 500, 502, 503, 504,
  ];

  return supportedStatusCodes.includes(status as HttpStatusCode) ? (status as HttpStatusCode) : 500;
}
