import { describe, expect, it } from "vitest";
import type { Incident } from "../types/incident";
import { getSlaMetrics, getSlaTargetHours, summarizeSlaMetrics } from "./slaMetrics";

const baseIncident: Pick<Incident, "createdAt" | "ownerTeam" | "riskScore" | "severity" | "status" | "reference"> = {
  createdAt: "2026-05-17T08:00:00.000Z",
  ownerTeam: "Payments Operations",
  reference: "FIN-TEST",
  riskScore: 50,
  severity: "Medium",
  status: "Under Review",
};

function incident(overrides: Partial<Incident>): Incident {
  return {
    ...baseIncident,
    id: "test-incident",
    title: "Test incident",
    description: "Demo incident",
    reportedBy: "Operations",
    affectedService: "Payments",
    paymentType: "Faster Payments",
    incidentCategory: "Payment Investigation",
    affectedCustomers: 1,
    transactionCount: 1,
    estimatedFinancialImpact: 100,
    customerImpact: "Medium",
    financialImpact: "Medium",
    slaUrgency: "Medium",
    systemImpact: "Medium",
    complianceSensitivity: "Medium",
    workaroundAvailability: "Partial",
    notes: "",
    category: "Payment Investigation",
    riskLabel: "Medium",
    slaStatus: "At Risk",
    stakeholderSummary: "",
    businessImpactReasoning: "",
    investigationPlaybook: [],
    rcaHypotheses: [],
    stakeholderUpdateDraft: "",
    recommendedAction: "",
    escalationRequirement: "",
    reconciliationPriority: "Standard triage",
    reportingNote: "",
    auditTrail: [],
    updatedAt: "2026-05-17T08:00:00.000Z",
    ...overrides,
  } as Incident;
}

describe("slaMetrics", () => {
  it("marks a critical incident as breached after the 2 hour target", () => {
    const metrics = getSlaMetrics(incident({ severity: "Critical" }), new Date("2026-05-17T10:30:00.000Z"));

    expect(metrics.targetHours).toBe(2);
    expect(metrics.status).toBe("Breached");
    expect(metrics.isBreached).toBe(true);
    expect(metrics.escalationTiming).toBe("Escalate immediately");
  });

  it("marks a high incident as at risk near the 4 hour target", () => {
    const metrics = getSlaMetrics(incident({ severity: "High" }), new Date("2026-05-17T11:30:00.000Z"));

    expect(metrics.targetHours).toBe(4);
    expect(metrics.status).toBe("At Risk");
    expect(metrics.recommendation).toContain("Prepare escalation");
  });

  it("keeps medium and low incidents on track within target", () => {
    expect(getSlaMetrics(incident({ severity: "Medium" }), new Date("2026-05-17T12:00:00.000Z")).status).toBe("On Track");
    expect(getSlaMetrics(incident({ severity: "Low" }), new Date("2026-05-18T08:00:00.000Z")).status).toBe("On Track");
    expect(getSlaTargetHours("Low")).toBe(72);
  });

  it("does not treat resolved or closed incidents as active breaches", () => {
    const resolved = getSlaMetrics(
      incident({ severity: "Critical", status: "Resolved" }),
      new Date("2026-05-18T08:00:00.000Z"),
    );

    expect(resolved.status).toBe("On Track");
    expect(resolved.isActive).toBe(false);
    expect(resolved.isBreached).toBe(false);
    expect(resolved.recommendation).toContain("No active escalation");
  });

  it("summarizes breached, at-risk, and next escalation recommendation", () => {
    const summary = summarizeSlaMetrics(
      [
        incident({ reference: "FIN-CRIT", severity: "Critical", riskScore: 90 }),
        incident({ reference: "FIN-HIGH", severity: "High", riskScore: 70 }),
        incident({ reference: "FIN-CLOSED", severity: "Critical", status: "Closed", riskScore: 100 }),
      ],
      new Date("2026-05-17T11:30:00.000Z"),
    );

    expect(summary.breachedCount).toBe(1);
    expect(summary.atRiskCount).toBe(1);
    expect(summary.nextEscalationRecommendation).toContain("FIN-CRIT");
  });
});
