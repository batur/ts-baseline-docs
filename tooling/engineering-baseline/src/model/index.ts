import { z } from "zod";

const IDENTIFIER = z.string().min(1);
const REQUIREMENT_ID = z.string().regex(/^FR-\d{3}$/u);
const SUCCESS_CRITERION_ID = z.string().regex(/^SC-\d{3}$/u);
const EVIDENCE_ID = z.string().regex(/^VE-\d{3}$/u);

const PROFILE_SCHEMA = z
  .object({
    artifacts: z.array(IDENTIFIER),
    enabled: z.boolean(),
  })
  .strict()
  .superRefine((profile, context) => {
    if (profile.enabled && profile.artifacts.length === 0) {
      context.addIssue({ code: "custom", message: "An enabled profile requires an artifact." });
    }
  });

export const BASELINE_CONFIG_SCHEMA = z
  .object({
    baselineVersion: z.literal("0.1.0"),
    profiles: z
      .object({
        asyncapi: PROFILE_SCHEMA,
        graphql: PROFILE_SCHEMA,
        grpc: PROFILE_SCHEMA,
        openapi: PROFILE_SCHEMA,
      })
      .strict(),
    schemaVersion: z.literal(1),
    specKitVersion: z.literal("1.0.5"),
  })
  .strict();

const SELECTORS_SCHEMA = z
  .object({
    fields: z.array(IDENTIFIER).min(1).optional(),
    messages: z.array(IDENTIFIER).min(1).optional(),
    operations: z.array(IDENTIFIER).min(1).optional(),
    rpcMethods: z.array(IDENTIFIER).min(1).optional(),
    types: z.array(IDENTIFIER).min(1).optional(),
  })
  .strict()
  .refine((selectors) => Object.keys(selectors).length > 0, "At least one selector is required.");

export const CONTRACT_CHANGE_SCHEMA = z
  .object({
    artifact: IDENTIFIER,
    artifactSha256: z.string().regex(/^[a-f\d]{64}$/u),
    compatibility: z
      .object({
        baseline: z.string().nullable(),
        classification: z.enum(["additive", "deprecation", "breaking"]),
        rationale: IDENTIFIER,
      })
      .strict(),
    deprecation: z
      .object({
        deprecatedElements: z.array(IDENTIFIER),
        intendedRemovalRelease: z.string().nullable(),
        notes: IDENTIFIER,
      })
      .strict(),
    id: z.string().regex(/^[a-z\d]+(?:-[a-z\d]+)*$/u),
    migration: z
      .object({
        deadline: z.string().nullable(),
        required: z.boolean(),
        rolloutNotes: IDENTIFIER,
        strategy: IDENTIFIER,
      })
      .strict(),
    owners: z
      .object({
        consumers: z.array(IDENTIFIER).min(1),
        provider: z.array(IDENTIFIER).min(1),
      })
      .strict(),
    profile: z.enum(["openapi", "asyncapi", "graphql", "grpc"]),
    requirementIds: z.array(REQUIREMENT_ID).min(1),
    selectors: SELECTORS_SCHEMA,
    successCriterionIds: z.array(SUCCESS_CRITERION_ID),
  })
  .strict()
  .superRefine((change, context) => {
    if (change.compatibility.classification === "breaking" && !change.migration.required) {
      context.addIssue({ code: "custom", message: "Breaking changes require migration." });
    }
    if (
      change.deprecation.deprecatedElements.length > 0 &&
      change.deprecation.intendedRemovalRelease === null
    ) {
      context.addIssue({
        code: "custom",
        message: "Deprecated elements require a removal release.",
      });
    }
  });

export const CONTRACT_MANIFEST_SCHEMA = z
  .object({
    contracts: z.array(CONTRACT_CHANGE_SCHEMA).min(1),
    feature: z.string().regex(/^\d{3}-[a-z\d]+(?:-[a-z\d]+)*$/u),
    schemaVersion: z.literal(1),
  })
  .strict();

export const VERIFICATION_SCHEMA = z
  .object({
    evidence: z.array(
      z
        .object({
          command: IDENTIFIER,
          id: EVIDENCE_ID,
          kind: z.enum(["automated", "manual"]),
          note: z.string().min(1).optional(),
          requirementIds: z.array(REQUIREMENT_ID),
          result: z.enum(["planned", "pass", "fail"]),
          successCriterionIds: z.array(SUCCESS_CRITERION_ID),
        })
        .strict(),
    ),
    feature: IDENTIFIER,
    redEvidence: z.array(z.unknown()).optional(),
    schemaVersion: z.literal(1),
  })
  .strict();

export type BaselineConfig = z.infer<typeof BASELINE_CONFIG_SCHEMA>;
export type ContractChange = z.infer<typeof CONTRACT_CHANGE_SCHEMA>;
export type ContractManifest = z.infer<typeof CONTRACT_MANIFEST_SCHEMA>;
export type Verification = z.infer<typeof VERIFICATION_SCHEMA>;
