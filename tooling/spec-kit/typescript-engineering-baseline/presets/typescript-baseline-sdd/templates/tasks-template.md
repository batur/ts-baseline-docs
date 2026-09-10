# Tasks: [Title]

For each behavior slice, preserve this order:

1. Define or update applicable contracts and manifests.
2. Enable a failing Cucumber scenario for observable behavior.
3. Add a focused failing Vitest test for the implementation behavior.
4. Implement the minimum behavior.
5. Refactor with Vitest green, then make Cucumber green.
6. Run contract generation/conformance and deterministic verification.
7. Record RED cause and final passing commands.

Never schedule implementation before current Gate 1 and Gate 2 approvals.
