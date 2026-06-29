# CI/CD & Git Templates

## CODEOWNERS

```txt
* @owner
.github/workflows/** @owner
.github/CODEOWNERS @owner
.github/pull_request_template.md @owner
src/shared/security/** @owner
src/shared/auth/** @owner
src/shared/database/** @owner
docs/openapi/** @owner
docs/adr/** @owner
```

## PR template

```md
## Summary

## Why

## Testing

- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests, if applicable
- [ ] Manual test, if applicable

## Risk / Rollback

## Checklist

- [ ] Lint passes
- [ ] Typecheck passes
- [ ] Tests pass
- [ ] Build passes
- [ ] No secrets added
- [ ] No sensitive data logged
- [ ] OpenAPI updated, if API changed
- [ ] Migration reviewed, if DB changed
- [ ] Env example updated, if env changed
- [ ] Raw SQL has written justification and review, if added
- [ ] AI-generated code manually reviewed, if used
```

## package scripts

```json
{
  "scripts": {
    "format": "prettier . --write",
    "format:check": "prettier . --check",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "build": "tsc -p tsconfig.build.json",
    "openapi:generate": "tsx scripts/generate-openapi.ts",
    "openapi:check": "pnpm openapi:generate && git diff --exit-code docs/openapi/openapi.yaml",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "secrets:scan": "gitleaks detect --source . --verbose",
    "secrets:scan:staged": "gitleaks protect --staged --verbose",
    "audit": "pnpm audit",
    "commitlint": "commitlint",
    "prepare": "lefthook install"
  }
}
```

## GitHub Actions baseline

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: ".nvmrc"
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - run: pnpm format:check
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
```

## lefthook.yml

```yaml
pre-commit:
  parallel: true
  commands:
    format:
      run: pnpm format:check
    lint:
      run: pnpm lint
    secrets:
      run: pnpm secrets:scan:staged
commit-msg:
  commands:
    commitlint:
      run: pnpm commitlint --edit {1}
pre-push:
  commands:
    typecheck:
      run: pnpm typecheck
    test:
      run: pnpm test
    build:
      run: pnpm build
```
