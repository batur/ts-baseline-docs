# ADR-0002: TypeScript Config

## Status

Accepted.

## Context

All TypeScript projects need a strict and consistent compiler baseline.

## Decision

Strict TypeScript is required. Additional strictness includes `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `noImplicitReturns` and `useUnknownInCatchVariables`.

Backend Node projects use `module: "NodeNext"` and `moduleResolution: "NodeNext"`. Frontend/bundler projects use `module: "ESNext"` and `moduleResolution: "Bundler"`.

Default target is ES2022. Backend projects use `lib: ["ES2022"]`. Frontend projects use `lib: ["ES2022", "DOM", "DOM.Iterable"]`.

`isolatedModules`, `verbatimModuleSyntax`, `resolveJsonModule`, `forceConsistentCasingInFileNames` and `skipLibCheck` are enabled.

Default alias is `@/* -> src/*`.

## Consequences

The compiler catches more defects early. Backend and frontend module resolution are explicit and aligned with their runtimes.
