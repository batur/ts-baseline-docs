import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";

import type { RequestWithId } from "./request-context.js";
import type { NextFunction, Response } from "express";

const REQUEST_ID_PATTERN = /^[a-zA-Z0-9_-]{1,100}$/u;

@Injectable()
export class RequestIdMiddleware {
  public use(request: RequestWithId, response: Response, next: NextFunction): void {
    const requestedId = request.header("x-request-id");
    const requestId =
      requestedId !== undefined && REQUEST_ID_PATTERN.test(requestedId)
        ? requestedId
        : randomUUID();

    request.requestId = requestId;
    response.setHeader("X-Request-Id", requestId);
    next();
  }
}
