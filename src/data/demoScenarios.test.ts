import { describe, expect, it } from "vitest";
import { demoIncidents } from "./demoIncidents";
import { demoScenarios, getDemoScenario } from "./demoScenarios";

describe("demoScenarios", () => {
  it("provides safe frontend-only incident scenarios", () => {
    expect(demoScenarios.length).toBeGreaterThan(1);
    expect(getDemoScenario("full").incidents).toHaveLength(demoIncidents.length);
    expect(getDemoScenario("reconciliation").incidents.every((incident) => incident.reconciliationPriority !== "Standard triage")).toBe(
      true,
    );
    expect(getDemoScenario("unknown").id).toBe("full");
  });
});
