import type { Incident, SlaStatus } from "../types/incident";

export interface SlaAgeing {
  ageDays: number;
  ageLabel: string;
  countdownLabel: string;
  urgencyLabel: string;
}

const checkpointHours: Record<SlaStatus, number> = {
  "Escalation Required": 2,
  Breached: 4,
  "At Risk": 12,
  "On Track": 24,
};

function parseDate(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Date.now();
}

export function getSlaAgeing(incident: Pick<Incident, "createdAt" | "slaStatus">, now = new Date()): SlaAgeing {
  const createdAt = parseDate(incident.createdAt);
  const elapsedHours = Math.max(0, Math.floor((now.getTime() - createdAt) / 3_600_000));
  const ageDays = Math.floor(elapsedHours / 24);
  const checkpoint = checkpointHours[incident.slaStatus];
  const remainingHours = checkpoint - (elapsedHours % 24);

  return {
    ageDays,
    ageLabel: ageDays === 0 ? "Opened today" : `${ageDays} day${ageDays === 1 ? "" : "s"} open`,
    countdownLabel:
      incident.slaStatus === "Breached" || incident.slaStatus === "Escalation Required"
        ? "Immediate action required"
        : `Next checkpoint within ${Math.max(1, remainingHours)} hours`,
    urgencyLabel: getSlaUrgencyLabel(incident.slaStatus),
  };
}

export function getSlaUrgencyLabel(slaStatus: SlaStatus) {
  if (slaStatus === "Escalation Required") return "Executive escalation now";
  if (slaStatus === "Breached") return "SLA breached";
  if (slaStatus === "At Risk") return "SLA at risk";
  return "SLA on track";
}
