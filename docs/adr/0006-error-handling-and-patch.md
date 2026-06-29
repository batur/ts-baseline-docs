# ADR-0006: Error Handling and PATCH

## Status

Accepted.

## Context

APIs need stable error behavior and safe partial update semantics.

## Decision

Use the standard error envelope with stable `error.code`, user-safe `error.message`, optional `details` and `requestId`.

Use `400` for malformed or structurally invalid requests. Use `422` for syntactically valid but semantically invalid requests. Use `401`, `403`, `404`, `409`, `412`, `415`, `429`, `500`, `502`, `503` and `504` according to standard HTTP semantics.

PATCH is partial update. Omitted field means unchanged. `null` clears only nullable fields. Empty PATCH body returns `400 EMPTY_UPDATE`. Unknown fields return `400`. Known but not allowed fields return `422`. Default success is `200` plus updated resource.

High-value mutable resources may use ETag / If-Match optimistic concurrency and return `412` on mismatch.

## Consequences

Clients can rely on stable error codes and unambiguous PATCH behavior.
