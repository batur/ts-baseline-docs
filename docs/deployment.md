# Deployment Standard

## Day-One Deployability

Every project must be deployable from day one. Even PoC and Alpha projects must have a working deployment path when the first development commit reaches `main`.

## Environments

Default environments:

- development
- staging
- production

Optional:

- preview

## Branch and Deployment Rules

- `main` is protected and production-ready.
- Production deployment happens only from `main` or release tags.
- Preview deployments may be created for PRs.
- Staging should be used before production when possible.

## Versioning

Semantic Versioning is mandatory for every project.

- PoC/Alpha: `0.x.y`
- Pre-release examples: `0.1.0-alpha.1`, `0.1.0-alpha.2`

Release metadata should expose:

- `RELEASE_VERSION`
- `COMMIT_SHA`

## Rollback

Production deployments must have a rollback strategy:

- previous deployment rollback
- previous Docker image
- release tag rollback
- migration compatibility considerations

DB migrations require explicit rollback/forward strategy when destructive or risky.

## Health Check

Backend services should expose health endpoints:

```txt
GET /health
GET /health/live
GET /health/ready
```

Readiness checks may include database and cache connectivity, but must not expose sensitive details publicly.
