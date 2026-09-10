# TypeScript Engineering Baseline 0.1.0

This integration-agnostic Spec Kit bundle installs the `typescript-baseline-sdd` preset,
`engineering-baseline-verify` extension, and `typescript-delivery` workflow. It combines living
specifications, two human gates, Cucumber acceptance behavior, Vitest TDD, contract-first external
boundaries, deterministic traceability, and proportional Full/Standard/Lightweight delivery.

The bundle requires Spec Kit 1.0.5 and pnpm 11.11.0. The official Spec Kit `opencode` integration is
supported and installs commands under `.opencode/commands/`; the active integration metadata is
recorded under `.specify/integrations/`. Version 0.1.0 is intentionally a dogfood
release; it must not be presented as stable 1.0.0 until the repository release-readiness checks
pass.

Install only reviewed artifacts. Workflow shell steps invoke literal `pnpm baseline:verify` or
`pnpm baseline:check` repository scripts and never interpolate prompt or agent output.
