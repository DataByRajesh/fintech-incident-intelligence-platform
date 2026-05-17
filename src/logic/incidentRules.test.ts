import { describe, expect, it } from "vitest";
import {
  calculateRiskScore,
  classifyIncident,
  createIncident,
  getEscalationRequirement,
  getReconciliationPriority,
  isReconciliationRisk,
} from "./incidentRules";
import type { IncidentDraft } from "../types/incident";

const baseDraft: IncidentDraft = {
  title: "Operational payment review",
  description: "A payment operations case requires triage.",
  reportedBy: "Payments Operations",
  affectedService: "Payments operations",
  paymentType: "Faster Payments",
  incidentCategory: "Unknown / Needs Review",
  affectedCustomers: 5,
  transactionCount: 10,
  estimatedFinancialImpact: 500,
  customerImpact: "Low",
  financialImpact: "Low",
  slaUrgency: "Low",
  systemImpact: "Low",
  complianceSensitivity: "Low",
  workaroundAvailability: "Available",
  ownerTeam: "Payments Operations",
  notes: "Demo test case.",
};

function buildIncident(overrides: Partial<IncidentDraft> = {}) {
  return createIncident({ ...baseDraft, ...overrides }, 0);
}

describe("incidentRules classification engine", () => {
  it("returns critical severity when financial, customer, regulatory, or SLA risk is high enough", () => {
    const incident = buildIncident({
      title: "Suspicious transaction alert",
      description: "Suspicious transaction alert triggered for high-value payments.",
      incidentCategory: "Suspicious Transaction Alert",
      affectedCustomers: 1200,
      transactionCount: 5200,
      estimatedFinancialImpact: 315000,
      customerImpact: "Critical",
      financialImpact: "Critical",
      slaUrgency: "Critical",
      complianceSensitivity: "Critical",
      workaroundAvailability: "Unavailable",
    });

    expect(incident.severity).toBe("Critical");
    expect(incident.riskLabel).toBe("Critical");
    expect(incident.escalationRequirement).toContain("Executive");
    expect(incident.recommendedAction).toContain("incident bridge");
  });

  it("returns high severity for a material payment/reconciliation issue requiring escalation", () => {
    const incident = buildIncident({
      title: "Card transaction reconciliation mismatch",
      description: "Card processor settlement total does not match the internal ledger.",
      paymentType: "Card",
      incidentCategory: "Reconciliation Mismatch",
      affectedCustomers: 85,
      transactionCount: 620,
      estimatedFinancialImpact: 74000,
      customerImpact: "Medium",
      financialImpact: "High",
      slaUrgency: "High",
      complianceSensitivity: "High",
      workaroundAvailability: "Partial",
    });

    expect(incident.severity).toBe("High");
    expect(incident.riskLabel).toBe("High");
    expect(incident.escalationRequirement).toContain("Operational escalation");
    expect(incident.reconciliationPriority).toBe("High-priority reconciliation review");
  });

  it("returns medium severity for a limited operational incident", () => {
    const incident = buildIncident({
      title: "Open Banking payment initiation failure",
      description: "Open Banking API timeout affected a small customer cohort.",
      paymentType: "Open Banking",
      incidentCategory: "API Error",
      affectedCustomers: 12,
      transactionCount: 18,
      estimatedFinancialImpact: 1500,
      customerImpact: "Medium",
      financialImpact: "Medium",
      slaUrgency: "Medium",
      systemImpact: "Medium",
      complianceSensitivity: "Low",
      workaroundAvailability: "Partial",
    });

    expect(incident.severity).toBe("Medium");
    expect(incident.riskLabel).toBe("Medium");
  });

  it("returns low severity for a minor informational incident", () => {
    const incident = buildIncident({
      title: "Minor payment operations query",
      description: "Informational payment operations review with no customer impact.",
      affectedCustomers: 0,
      transactionCount: 0,
      estimatedFinancialImpact: 0,
    });

    expect(incident.severity).toBe("Low");
    expect(incident.riskLabel).toBe("Low");
    expect(calculateRiskScore(incident)).toBeLessThanOrEqual(30);
  });

  it("marks reconciliation mismatch as high reconciliation priority", () => {
    const incident = buildIncident({
      incidentCategory: "Reconciliation Mismatch",
      estimatedFinancialImpact: 80000,
      affectedCustomers: 80,
      transactionCount: 500,
      slaUrgency: "High",
      complianceSensitivity: "High",
    });

    expect(isReconciliationRisk(incident)).toBe(true);
    expect(getReconciliationPriority(incident)).toBe("High-priority reconciliation review");
  });

  it("requires escalation for regulatory impact", () => {
    const incident = buildIncident({
      incidentCategory: "Suspicious Transaction Alert",
      estimatedFinancialImpact: 40000,
      complianceSensitivity: "Critical",
      slaUrgency: "High",
    });

    expect(getEscalationRequirement(incident)).not.toContain("No formal escalation");
  });

  it("includes all expected classification output fields", () => {
    const incident = buildIncident({
      title: "Duplicate customer debit investigation",
      description: "Customer was charged twice after duplicate capture.",
      incidentCategory: "Duplicate Debit",
      estimatedFinancialImpact: 12800,
      affectedCustomers: 48,
      transactionCount: 96,
      slaUrgency: "Critical",
    });

    expect(classifyIncident(incident)).toBe("Duplicate Debit");
    expect(incident.severity).toBeTruthy();
    expect(incident.riskLabel).toBeTruthy();
    expect(incident.recommendedAction).toBeTruthy();
    expect(incident.escalationRequirement).toBeTruthy();
    expect(incident.reconciliationPriority).toBeTruthy();
    expect(incident.reportingNote).toBeTruthy();
  });
});
