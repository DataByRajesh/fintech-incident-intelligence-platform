import { describe, expect, it } from "vitest";
import { demoIncidents } from "../data/demoIncidents";
import { buildPriorityMatrix } from "./priorityMatrix";

describe("buildPriorityMatrix", () => {
  it("groups operational priority cells from incidents", () => {
    const matrix = buildPriorityMatrix(demoIncidents);

    expect(matrix.map((cell) => cell.label)).toEqual([
      "Critical SLA pressure",
      "High-risk SLA watch",
      "Reconciliation priority",
      "Customer or exposure pressure",
    ]);
    expect(matrix.find((cell) => cell.label === "Critical SLA pressure")?.count).toBeGreaterThan(0);
    expect(matrix.find((cell) => cell.label === "Reconciliation priority")?.count).toBeGreaterThan(0);
  });
});
