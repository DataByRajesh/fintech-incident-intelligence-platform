import { describe, expect, it } from "vitest";
import { demoIncidents } from "../data/demoIncidents";
import { createStatusTimelineEvent, getIncidentTimeline } from "./activityTimeline";
import { createIncident } from "./incidentRules";

describe("activityTimeline", () => {
  it("generates timeline events for demo incidents", () => {
    const timeline = getIncidentTimeline(demoIncidents[0]);

    expect(timeline.some((event) => event.label === "Incident created")).toBe(true);
    expect(timeline.some((event) => event.label === "Severity classified")).toBe(true);
    expect(timeline.some((event) => event.type === "Reconciliation Review")).toBe(true);
  });

  it("adds creation and classification events for new incidents", () => {
    const incident = createIncident(
      {
        title: "Demo payment incident",
        description: "Demo-only payment incident for timeline testing.",
        reportedBy: "Payments Operations",
        affectedService: "Payment processing",
        paymentType: "Card",
        incidentCategory: "Duplicate Debit",
        affectedCustomers: 12,
        transactionCount: 20,
        estimatedFinancialImpact: 2500,
        customerImpact: "High",
        financialImpact: "Medium",
        slaUrgency: "High",
        systemImpact: "Medium",
        complianceSensitivity: "High",
        workaroundAvailability: "Partial",
        ownerTeam: "Payments Operations",
        notes: "Demo notes only.",
      },
      12,
    );

    expect(incident.timeline.map((event) => event.label)).toContain("Incident created");
    expect(incident.timeline.map((event) => event.label)).toContain("Severity classified");
    expect(incident.timeline.some((event) => event.type === "Escalation Recommended")).toBe(true);
  });

  it("creates a status update timeline event", () => {
    const event = createStatusTimelineEvent(demoIncidents[0], "Resolved", "New", "2026-05-17T12:00:00.000Z");

    expect(event.type).toBe("Status Updated");
    expect(event.label).toBe("Status updated");
    expect(event.description).toContain("New to Resolved");
  });
});
