import { describe, expect, it } from "vitest";
import { demoIncidents } from "../data/demoIncidents";
import { buildDashboardMetrics } from "./dashboardMetrics";
import { isReconciliationRisk } from "./incidentRules";

describe("buildDashboardMetrics", () => {
  it("calculates executive dashboard metrics from incidents", () => {
    const metrics = buildDashboardMetrics(demoIncidents);

    expect(metrics.totalIncidents).toBe(demoIncidents.length);
    expect(metrics.criticalHighIncidents).toBe(
      demoIncidents.filter((incident) => ["Critical", "High"].includes(incident.riskLabel)).length,
    );
    expect(metrics.openIncidents).toBe(
      demoIncidents.filter((incident) => !["Resolved", "Closed"].includes(incident.status)).length,
    );
    expect(metrics.slaRiskCount).toBe(
      demoIncidents.filter((incident) => ["Breached", "Escalation Required"].includes(incident.slaStatus)).length,
    );
    expect(metrics.reconciliationBreaks).toBe(demoIncidents.filter(isReconciliationRisk).length);
    expect(metrics.estimatedFinancialExposure).toBe(
      demoIncidents.reduce((total, incident) => total + incident.estimatedFinancialImpact, 0),
    );
    expect(metrics.affectedCustomerTotal).toBe(
      demoIncidents.reduce((total, incident) => total + incident.affectedCustomers, 0),
    );
  });

  it("returns recent high-risk incidents ordered by risk", () => {
    const metrics = buildDashboardMetrics(demoIncidents);

    expect(metrics.recentHighRiskIncidents.length).toBeGreaterThan(0);
    expect(metrics.recentHighRiskIncidents.length).toBeLessThanOrEqual(5);
    expect(metrics.recentHighRiskIncidents[0].riskScore).toBeGreaterThanOrEqual(
      metrics.recentHighRiskIncidents.at(-1)?.riskScore ?? 0,
    );
  });
});
