---
name: database-persistence
description: Apply the TypeScript database and persistence architecture standard. Use when adding or reviewing PostgreSQL, Supabase, Drizzle, Prisma, MongoDB, Firebase/Firestore, repositories, migrations, transactions, tenant-scoped queries, serializers, IDs, timestamps, soft delete, raw SQL, indexes, constraints, audit logs, or persistence tests.
---

# Database / Persistence Skill

## When to use this skill

Use this skill when a task touches database or persistence work:

- Tables, collections, documents, migrations, indexes, constraints, seeds, or schema design.
- PostgreSQL, Supabase, Drizzle, Prisma, MongoDB, Firebase, or Firestore.
- Repositories, query modules, mappers, serializers, transactions, tenant-scoped data access, or raw SQL.
- API data persistence, cursor pagination, audit logs, soft delete, or outbox-like workflows.
- AI review of persistence safety, architecture boundaries, migrations, tenant boundaries, and raw SQL.

## Goal

Keep domain/application logic independent from database and provider details while making persistence explicit, safe, testable, and production-ready.

Technology can vary by project. The persistence boundary rules do not.

## Default profile

Unless an accepted project decision says otherwise, use this priority:

1. PostgreSQL.
2. Supabase as the default BaaS profile.
3. MongoDB only when a document-first model is justified.
4. Firebase / Firestore when realtime, offline, or client-first development is central.

For PostgreSQL/Supabase backend work, default to:

```txt
PostgreSQL or Supabase Postgres + Drizzle ORM + versioned migrations
```

Prisma is an accepted alternative profile, especially for generated-client DX, broader database support, or MongoDB support.

The persistence boundary is more important than the selected ORM.

## Core rules

- PostgreSQL is the default relational database.
- Supabase is the default Backend-as-a-Service profile.
- Supabase Postgres is treated as PostgreSQL.
- Drizzle is the default ORM for PostgreSQL/Supabase backend boilerplates.
- Prisma is an accepted alternative, not the default.
- MongoDB and Firebase/Firestore are supported profiles only when justified.
- Domain/application code must not directly import Drizzle, Prisma, Supabase JS, Firebase SDK, MongoDB driver, or provider-specific persistence SDKs.
- Use repository/query modules when business logic depends on persistence.
- Use serializers to produce API DTOs. Never return DB rows/documents directly from APIs.
- Use versioned migrations where supported.
- Do not use production schema push as the deployment mechanism.
- Use explicit transactions for related writes.
- Tenant-scoped resources must include tenant/organization filters in queries.
- Raw SQL requires written justification, parameterization, tenant-safety, explicit review, and tests when critical.

## Profile rules

### PostgreSQL / Supabase

- Use Drizzle by default.
- Use versioned migrations.
- Define constraints, indexes, timestamps, and tenant keys explicitly.
- Use `snake_case` table/column names.
- Use `camelCase` TypeScript fields.
- Keep Supabase service-role keys server-only.
- Client-side Supabase access must rely on reviewed RLS policies.
- Server-side privileged operations must go through use-cases/adapters.
- Supabase JS must not leak into domain/application logic.

### Prisma

Use Prisma when the project explicitly values generated-client DX, fast CRUD-heavy development, broader database support, or MongoDB support.

Rules:

- Keep Prisma Client behind repositories/query modules.
- Do not use generated Prisma models as API DTOs by default.
- Use migrations for supported relational databases.
- Be careful with Supabase RLS and privileged server access.

### MongoDB

Use MongoDB only when the data model is naturally document-oriented.

Good fit: nested aggregates, flexible schema as a real advantage, low join/reporting needs, content/event/log/document-heavy data.

Poor fit: strong relational integrity, complex joins/reporting, billing/permissions/tenant relations, or transaction-heavy workflows.

Rules:

- Validate boundaries with Zod.
- Do not accept raw Mongo query objects from clients.
- Define indexes intentionally.
- Review multi-document transaction needs.
- Keep driver/ODM code behind adapters/repositories.

### Firebase / Firestore

Use Firebase/Firestore when realtime, offline, or client-first development is central.

Rules:

- Firestore Security Rules are part of application security.
- Test Security Rules when clients access Firestore directly.
- Keep Firebase Admin SDK behind server adapters.
- Document intentional denormalization and query/index trade-offs.

## Folder placement

Simple backend shape:

```txt
src/
  shared/database/
    database.ts
    schema/*.table.ts
  modules/users/
    user.repository.ts
    drizzle-user.repository.ts
    user.mapper.ts
    create-user.use-case.ts
    user.serializer.ts

drizzle/migrations/
```

Complex component shape, only when complexity requires it:

```txt
src/modules/users/
  application/user.repository.ts
  application/create-user.use-case.ts
  domain/user.ts
  infrastructure/drizzle-user.repository.ts
  infrastructure/user.mapper.ts
  presentation/user.serializer.ts
```

Do not create empty layered folders just to look architectural.

## Naming, IDs, and timestamps

SQL database naming:

- Tables/columns: `snake_case`.
- TypeScript models/DTOs: `camelCase`.
- Mapping happens at repository/mapper/serializer boundaries.

Public IDs:

- Do not expose auto-increment integers by default.
- Prefer string IDs, ideally resource-prefixed: `usr_...`, `org_...`, `prj_...`, `api_key_...`.
- UUID is acceptable.

Timestamps:

- Mutable relational tables should include `created_at` and `updated_at`.
- Soft-deletable tables include `deleted_at`.
- Store timestamps in UTC.
- API responses return ISO 8601 strings.

## Soft delete rules

Soft delete is opt-in.

Use it for recoverable user-facing data, compliance/audit-sensitive records, or business data where history matters.

Avoid it for temporary tokens, cache tables, ephemeral jobs, and many simple join tables.

Default queries must exclude soft-deleted records.

## Repository and query module rules

Use repositories when:

- Business flow depends on DB operations.
- Transaction boundaries exist.
- Tenant boundaries must be enforced.
- The dependency should be fakeable in use-case tests.
- Database/provider details should stay outside application/domain logic.

Use query modules for simple read-only/reporting queries when a repository abstraction adds ceremony without value.

Repository interfaces belong on the application/domain side when abstraction is needed. Implementations belong in infrastructure/persistence.

## Mapping and serializer rules

Never return DB rows/documents directly from API handlers.

Expected flow:

```txt
DB row/document → mapper/repository → domain/application model → serializer → API DTO
```

Example row mapping:

```ts
function mapUserRow(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
```

Example serializer:

```ts
function serializeUser(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt.toISOString(),
  };
}
```

## Transaction rules

Use explicit transactions for related writes, such as:

- User creation + organization membership.
- Payment + subscription update.
- Order + inventory update.
- State change + outbox/event write.
- Critical mutation + audit log.

The transaction boundary belongs in the use-case/application layer. Repositories may accept a transaction context.

```ts
await DATABASE.transaction(async (tx) => {
  await USER_REPOSITORY.create(input, tx);
  await AUDIT_LOG_REPOSITORY.create(event, tx);
});
```

## Tenant-safe query rules

Tenant-scoped access must include `organizationId` or `tenantId`.

Prefer:

```ts
await PROJECT_REPOSITORY.findByIdForOrganization(projectId, organizationId);
```

Avoid for tenant-scoped resources:

```ts
await PROJECT_REPOSITORY.findById(projectId);
```

Admin/internal access must be explicit:

```ts
await PROJECT_REPOSITORY.findByIdForAdmin(projectId);
```

Cross-tenant access should usually behave as not found to avoid resource enumeration.

## Constraints, indexes, and pagination

Application validation is not enough for data integrity.

Use DB constraints for critical invariants where practical:

- Unique email, slug, or `(organization_id, slug)`.
- Foreign keys.
- Not-null constraints.
- Check constraints where appropriate.

Add indexes intentionally for common filters/sorts:

- `organization_id`
- `created_at`
- `status`
- foreign keys
- unique natural keys

Cursor pagination is preferred for public collections. Use deterministic ordering, commonly `created_at DESC, id DESC`. Offset pagination is acceptable for small internal/admin lists.

## Raw SQL review gate

Raw SQL is allowed only when ORM/query builder is insufficient or makes the query less clear/safe.

Every raw SQL block must include written justification covering:

- Why ORM/query builder is not enough.
- Parameterization of all user input.
- Tenant/organization boundary.
- Index/performance implications.
- Transaction needs.
- Test coverage.
- Reviewer expectation.

Required pattern:

```ts
/**
 * Raw SQL justification:
 * - Reason: Drizzle query builder cannot express this recursive CTE clearly.
 * - Safety: All user inputs are parameterized.
 * - Tenant boundary: organization_id is included in WHERE clause.
 * - Review: Requires persistence/security review.
 */
const rows = await db.execute(sql`
  SELECT * FROM projects
  WHERE id = ${projectId}
    AND organization_id = ${organizationId}
`);
```

Never concatenate user input into query strings.

```ts
// Forbidden
sql.raw(`SELECT * FROM users WHERE email = '${email}'`);
```

## Supabase, Firebase, and client access rules

Supabase:

- Service role key is server-only.
- Client-side access must rely on reviewed RLS.
- RLS policies must be reviewed when tables or access patterns change.
- Server-side privileged operations go through adapters/use-cases.

Firebase/Firestore:

- Security Rules are part of the security model.
- Test Security Rules for client-side direct access.
- Keep Admin SDK behind server adapters.
- Do not treat frontend checks as database security.

## Audit and outbox rules

Application logs and audit logs are different.

Use audit logs for sensitive business/security actions:

- Role/permission changed.
- Billing plan changed.
- API key created/revoked.
- Organization member removed.
- Security-sensitive admin action.

Outbox pattern is optional advanced profile. Use it when reliable event/job/webhook publishing must be tied to a DB write.

## Seeding rules

- Dev seed is allowed.
- Test seed must be deterministic.
- Production seed requires explicit/manual review.
- Seeds must not accidentally modify production data.

## Coding workflow

When adding persistence code:

1. Identify the persistence profile.
2. Check ADR/docs before choosing provider or ORM.
3. Keep SDK/ORM imports out of domain/application logic.
4. Add/update schema and migration when persistence shape changes.
5. Put business-related data access behind repository/query modules.
6. Add tenant/org filters for tenant-scoped data.
7. Use transactions for related writes.
8. Add constraints/indexes for important invariants and access patterns.
9. Map DB/document models to domain/application models.
10. Serialize API responses explicitly.
11. Add raw SQL justification and tests if raw SQL is used.
12. Update docs, ADRs, OpenAPI, and tests when relevant.

## Review checklist

Before accepting persistence changes, verify:

- PostgreSQL/Supabase/Drizzle default is followed unless another profile is justified.
- Prisma/MongoDB/Firebase usage has an explicit project reason.
- Domain/application code does not import ORM/SDK/provider details.
- Schema changes include migrations where applicable.
- Production schema push is not assumed.
- SQL names are `snake_case`; TypeScript names are `camelCase`.
- Public IDs are not auto-increment integers.
- Mutable tables have timestamps.
- Soft delete is opt-in and default queries exclude deleted rows.
- Related writes use transactions.
- Tenant-scoped queries include tenant/org filters.
- DB rows/documents are not returned directly from APIs.
- Serializers produce response DTOs.
- Critical invariants have DB constraints where practical.
- Indexes exist for important filters/sorts.
- Cursor pagination uses deterministic ordering.
- Raw SQL has justification, parameterization, tenant filtering, explicit review, and tests.
- Supabase service role key is server-only.
- RLS/Security Rules are reviewed when applicable.
- Persistence tests cover critical behavior.

## Required tests

Add or update tests for:

- Repository/query behavior when persistence logic is important.
- Tenant boundary enforcement.
- Transactional workflows.
- Soft delete default exclusion.
- Unique/conflict handling.
- Cursor pagination ordering.
- Raw SQL behavior and security-relevant filters.
- Provider/DB error mapping when relevant.
- Supabase RLS or Firestore Security Rules when direct client access exists.

## Anti-patterns

Avoid:

- Returning DB rows/documents directly from API handlers.
- Importing persistence SDKs inside domain/application logic.
- Generic tenant-scoped `findById` without tenant filter.
- Production schema push.
- Exposed auto-increment public IDs.
- Implicit multi-write operations without transactions.
- Raw SQL without justification.
- Raw SQL with string-concatenated user input.
- Client-provided Mongo query objects.
- Frontend checks as database security.
- Repositories for every trivial read.
- Layered folders before complexity exists.

## Done criteria

A persistence change is done when:

- It follows the selected persistence profile.
- The persistence boundary is respected.
- Schema/migration changes are complete where applicable.
- Tenant, auth, transaction, and raw SQL safety are handled.
- API DTOs are produced through serializers.
- Critical tests are added or updated.
- Docs, ADRs, and OpenAPI are updated when the change affects contracts or architecture.
