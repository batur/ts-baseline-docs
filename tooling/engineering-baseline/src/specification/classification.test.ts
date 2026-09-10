import { describe, expect, it } from "vitest";

import { classifyChange, requiredArtifactsForLane } from "./classification.js";

describe("delivery classification", () => {
  it.each([
    ["user-visible behavior", "full"],
    ["security or authorization behavior", "full"],
    ["persistence semantics", "full"],
    ["an external interface", "full"],
    ["an internal defect without an external boundary", "standard"],
    ["a behavior-preserving refactor", "lightweight"],
    ["an editorial correction", "lightweight"],
  ] as const)("classifies %s as %s", (change, expected) => {
    expect(classifyChange(change)).toBe(expected);
  });

  it("requires Gherkin for a Standard change only when observable behavior changes", () => {
    expect(requiredArtifactsForLane("standard", true)).toContain("gherkin");
    expect(requiredArtifactsForLane("standard", false)).not.toContain("gherkin");
  });

  it("does not invent contracts or Gherkin for Lightweight work", () => {
    expect(requiredArtifactsForLane("lightweight", false)).toEqual([
      "intent",
      "invariants",
      "checks",
    ]);
  });
});
