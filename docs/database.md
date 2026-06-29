# Database and Persistence Standard

## Default Profiles

Default priority:

1. PostgreSQL
2. Supabase
3. MongoDB profile
4. Firebase / Firestore profile

Default PostgreSQL/Supabase persistence stack:

- PostgreSQL / Supabase Postgres
- Drizzle ORM
- versioned migrations
- repository/query module boundary

## Alternatives

- Prisma is an accepted alternative profile, especially for generated client DX, MongoDB support, broader database support or CRUD-heavy admin/API projects.
- Kysely is an advanced SQL-heavy profile.
- MongoDB is a document database profile when the data model is genuinely document-oriented.
- Firebase/Firestore is a BaaS/document/realtime profile for client-first, realtime or offline-centric products.

## Boundary Rule

The persistence boundary is more important than the selected ORM.

Domain/application code must not directly depend on Drizzle, Prisma, Supabase JS, Firebase SDK or MongoDB driver details.

## Supabase

- Supabase is the default BaaS profile.
- Supabase Postgres is treated as PostgreSQL.
- Service role key is server-only.
- Client-side Supabase access relies on reviewed RLS policies.
- Supabase JS must not leak into domain/application logic.

## Migrations

- Versioned migrations are required where applicable.
- Production must not rely on direct schema push.
- Migration files are committed and reviewed.
- Destructive migrations require explicit review.

## Naming

- SQL database tables/columns use `snake_case`.
- TypeScript models/DTOs use `camelCase`.

## IDs

- Public IDs should not be auto-increment integers.
- String IDs with resource prefixes are preferred, e.g. `usr_`, `org_`, `prj_`.

## Timestamps

- Mutable tables use `created_at` and `updated_at`.
- Timestamps are stored in UTC.
- API responses return ISO 8601 strings.

## Soft Delete

Soft delete is opt-in. Soft-deleted records are excluded from default queries.

## Transactions

- Transaction boundaries are explicit.
- Multiple related writes run in a transaction when supported by the database.
- Transaction boundaries are defined at use-case/application level.

## Tenant-Safe Queries

Tenant-scoped queries require `organizationId` or `tenantId`. Avoid generic `findById` for tenant-scoped resources.

## Raw SQL

Raw SQL is allowed only with written justification and explicit review.

Rules:

- Must be parameterized.
- Must never concatenate user input into query strings.
- Tenant-scoped raw SQL must include tenant/org filter.
- Must explain why ORM/query builder is insufficient.
- Must be tested when behavior, security or performance is critical.

Required comment format:

```ts
/**
 * Raw SQL justification:
 * - Reason:
 * - Safety:
 * - Tenant boundary:
 * - Review:
 */
```

## API Boundary

Database/document models are not returned directly from API. Serializers produce API DTOs.
