# ADR-0014: Database and Persistence Standard

## Status

Accepted.

## Context

Projects need a persistence standard that supports relational, BaaS, document and realtime profiles while keeping business logic independent from storage details.

## Decision

Default DB is PostgreSQL. Default BaaS is Supabase. Default PostgreSQL/Supabase ORM is Drizzle.

Supabase Postgres is treated as PostgreSQL. Prisma is an accepted alternative profile, especially for generated client DX, MongoDB support, broader DB support or CRUD-heavy projects. MongoDB and Firebase/Firestore profiles are supported when justified.

Persistence boundary is more important than selected ORM. Domain/application code must not directly depend on Drizzle, Prisma, Supabase JS, Firebase SDK or MongoDB driver details.

Versioned migrations are required where applicable. Production schema push is not allowed. SQL naming uses snake_case; TypeScript uses camelCase. Public IDs should be string/prefixed, not auto-increment integers. UTC timestamps are used.

Transactions are explicit. Tenant-scoped queries require tenant/org filter. DB/document models do not leak to API. Serializers produce DTOs.

Raw SQL is allowed only with written justification and explicit review. It must be parameterized, tenant-safe and tested when critical.

## Consequences

Persistence remains flexible while PostgreSQL/Supabase/Drizzle provide the default path.
