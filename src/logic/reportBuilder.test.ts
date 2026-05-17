import { describe, expect, it } from "vitest";
import { demoIncidents } from "../data/demoIncidents";
import {
  buildManagementReport,
  buildReportExport,
  buildReportText,
  getSeverityClassName,
  getSeverityPercentage,
} from "./reportBuilder";

describe("buildManagementReport", () => {
  it("builds an operational summary with incident count", () => {
    const report = buildManagementReport(demoIncidents);

    expect(report.operationalSummary).toContain(`${demoIncidents.length} demo incidents`);
    expect(report.totalIncidents).toBe(demoIncidents.length);
  });

  it("calculates severity breakdown correctly", () => {
    const report = buildManagementReport(demoIncidents);
    const totalBreakdown = report.severityBreakdown.reduce((total, item) => total + item.count, 0);

    expect(totalBreakdown).toBe(demoIncidents.length);
    expect(report.severityBreakdown.some((item) => item.severity === "Critical")).toBe(true);
  });

  it("summarizes reconciliation issues", () => {
    const report = buildManagementReport(demoIncidents);

    expect(report.reconciliationIncidents.length).toBeGreaterThan(0);
    expect(report.reconciliationSummary.toLowerCase()).toContain("reconciliation");
    expect(report.slaEscalationSummary.toLowerCase()).toContain("sla");
  });

  it("calculates customer impact and financial exposure", () => {
    const report = buildManagementReport(demoIncidents);
    const expectedCustomers = demoIncidents.reduce((total, incident) => total + incident.affectedCustomers, 0);
    const expectedExposure = demoIncidents.reduce((total, incident) => total + incident.estimatedFinancialImpact, 0);

    expect(report.affectedCustomers).toBe(expectedCustomers);
    expect(report.totalExposure).toBe(expectedExposure);
    expect(report.customerImpactSummary).toContain(expectedCustomers.toLocaleString("en-GB"));
    expect(report.financialExposureSummary).toContain("highest-risk exposure");
  });

  it("generates management update and next steps", () => {
    const report = buildManagementReport(demoIncidents);

    expect(report.managementUpdate).toContain("risk operations");
    expect(report.nextSteps.length).toBeGreaterThan(0);
  });

  it("supports report display helpers", () => {
    expect(getSeverityPercentage(2, 10)).toBe(20);
    expect(getSeverityPercentage(0, 0)).toBe(0);
    expect(getSeverityClassName("Critical")).toBe("severity-critical");
  });

  it("builds a structured report export payload", () => {
    const exportPayload = buildReportExport(demoIncidents);
    const reportText = buildReportText(demoIncidents);

    expect(exportPayload.reportType).toBe("Operational incident management summary");
    expect(exportPayload.metrics.totalIncidents).toBe(demoIncidents.length);
    expect(exportPayload.incidents[0]).toHaveProperty("reference");
    expect(reportText).toContain("Operational summary");
    expect(reportText).toContain("Reconciliation summary");
    expect(reportText).toContain("SLA/escalation summary");
    expect(reportText).toContain("Financial exposure summary");
  });
});
