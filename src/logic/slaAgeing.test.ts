import { describe, expect, it } from "vitest";
import { getEscalationTimingLabel, getSlaAgeing, getSlaUrgencyLabel } from "./slaAgeing";

describe("getSlaAgeing", () => {
  it("returns stable ageing and checkpoint labels", () => {
    const ageing = getSlaAgeing(
      { createdAt: "2026-05-15T09:00:00.000Z", slaStatus: "At Risk" },
      new Date("2026-05-17T10:00:00.000Z"),
    );

    expect(ageing.ageDays).toBe(2);
    expect(ageing.ageLabel).toBe("2 days open");
    expect(ageing.countdownLabel).toContain("Next checkpoint");
    expect(ageing.escalationTimingLabel).toContain("Escalate if not recovered");
    expect(ageing.urgencyLabel).toBe("SLA at risk");
  });

  it("marks breached and escalated incidents as immediate action", () => {
    expect(getSlaAgeing({ createdAt: "2026-05-17T09:00:00.000Z", slaStatus: "Breached" }).countdownLabel).toBe(
      "Immediate action required",
    );
    expect(getSlaUrgencyLabel("Escalation Required")).toBe("Executive escalation now");
    expect(getEscalationTimingLabel("On Track", 24)).toBe("Review at next checkpoint within 24 hours");
  });
});
