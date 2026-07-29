# Dependency Security Exceptions

High and critical dependency advisories may be ignored only when no compatible fix is available, the affected path is understood, mitigations are documented and the exception has an owner and review date.

## GHSA-mh99-v99m-4gvg

- Package: `brace-expansion@1.1.16`
- Advisory: `GHSA-mh99-v99m-4gvg` / `CVE-2026-14257`
- Severity: High
- Dependency path: Development-only ESLint tooling through `minimatch@3.1.5`
- Runtime exposure: None. The package is not included in application dependencies or production output.
- Reason accepted: The advisory marks every release through `5.0.7` as affected. The current ESLint dependency graph still requires the legacy `brace-expansion` API through `minimatch@3`. Forcing the patched `brace-expansion@5.0.8` release is incompatible and causes ESLint to fail with `TypeError: expand is not a function`.
- Mitigation: ESLint receives only repository-controlled file and ignore patterns. Do not pass user-controlled or other untrusted brace/glob patterns to repository tooling. `brace-expansion@1.1.16` is retained because it includes the compatible fix for `GHSA-3jxr-9vmj-r5cp`.
- Resolution condition: Remove this exception when ESLint and its `minimatch` dependency support a release using `brace-expansion@5.0.8` or later, or when a compatible backport is published.
- Owner: `@batur`
- Accepted: 2026-07-30
- Review by: 2026-08-30

The exception is configured under `auditConfig.ignoreGhsas` in `pnpm-workspace.yaml`. To reassess it, remove that entry on the review branch and run:

```bash
pnpm audit
```
