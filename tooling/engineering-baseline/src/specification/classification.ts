export type DeliveryLane = "full" | "lightweight" | "standard";
export type RequiredArtifact =
  "checks" | "contracts" | "gherkin" | "intent" | "invariants" | "specification" | "tdd";

const FULL_MARKERS = [
  "user-visible",
  "security",
  "authorization",
  "persistence",
  "external interface",
];

export function classifyChange(change: string): DeliveryLane {
  const normalized = change.toLowerCase();

  if (FULL_MARKERS.some((marker) => normalized.includes(marker))) {
    return "full";
  }

  if (normalized.includes("defect") || normalized.includes("internal behavior")) {
    return "standard";
  }

  return "lightweight";
}

export function requiredArtifactsForLane(
  lane: DeliveryLane,
  observableBehaviorChanged: boolean,
): RequiredArtifact[] {
  if (lane === "full") {
    return ["specification", "gherkin", "contracts", "tdd", "checks"];
  }

  if (lane === "standard") {
    return observableBehaviorChanged
      ? ["specification", "gherkin", "tdd", "checks"]
      : ["specification", "tdd", "checks"];
  }

  return ["intent", "invariants", "checks"];
}
