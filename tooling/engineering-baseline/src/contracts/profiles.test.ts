import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  checkProfileCompatibility,
  generateProfileSummary,
  validateProfileArtifact,
} from "./profiles.js";

const fixtureRoot = path.resolve("tooling/engineering-baseline/fixtures/contracts");

describe.each(["openapi", "asyncapi", "graphql", "proto"] as const)("%s profile", (profile) => {
  it("validates, generates, and accepts a compatible change", async () => {
    const previous = await readFile(
      path.join(
        fixtureRoot,
        profile,
        profile === "graphql"
          ? "previous.graphql"
          : profile === "proto"
            ? "previous.proto"
            : "previous.yaml",
      ),
      "utf8",
    );
    const current = await readFile(
      path.join(
        fixtureRoot,
        profile,
        profile === "graphql"
          ? "current.graphql"
          : profile === "proto"
            ? "current.proto"
            : "current.yaml",
      ),
      "utf8",
    );

    expect(validateProfileArtifact(profile, current)).toEqual([]);
    expect(checkProfileCompatibility(profile, previous, current)).toEqual([]);
    expect(generateProfileSummary(profile, current)).toEqual(
      generateProfileSummary(profile, current),
    );
  });

  it("rejects an intentional breaking fixture", async () => {
    const previous = await readFile(
      path.join(
        fixtureRoot,
        profile,
        profile === "graphql"
          ? "previous.graphql"
          : profile === "proto"
            ? "previous.proto"
            : "previous.yaml",
      ),
      "utf8",
    );
    const breaking = await readFile(
      path.join(
        fixtureRoot,
        profile,
        profile === "graphql"
          ? "breaking.graphql"
          : profile === "proto"
            ? "breaking.proto"
            : "breaking.yaml",
      ),
      "utf8",
    );

    expect(checkProfileCompatibility(profile, previous, breaking)).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "CONTRACT_BREAKING_CHANGE" })]),
    );
  });
});

describe("profile selection", () => {
  it("does not require inactive profile tools", async () => {
    const { requiredToolPackages } = await import("./profiles.js");
    expect(requiredToolPackages(["openapi"])).toEqual([
      "@redocly/cli",
      "@stoplight/prism-cli",
      "orval",
      "oasdiff",
    ]);
  });
});
