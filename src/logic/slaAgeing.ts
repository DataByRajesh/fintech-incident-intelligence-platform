import type { Incident, SlaStatus } from "../types/incident";

export interface SlaAgeing {
  ageDays: number;
  ageLabel: string;
  countdownLabel: string;
  escalationTimingLabel: string;
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
    escalationTimingLabel: getEscalationTimingLabel(incident.slaStatus, Math.max(1, remainingHours)),
    urgencyLabel: getSlaUrgencyLabel(incident.slaStatus),
  };
}

export function getSlaUrgencyLabel(slaStatus: SlaStatus) {
  if (slaStatus === "Escalation Required") return "Executive escalation now";
  if (slaStatus === "Breached") return "SLA breached";
  if (slaStatus === "At Risk") return "SLA at risk";
  return "SLA on track";
}

export function getEscalationTimingLabel(slaStatus: SlaStatus, remainingHours: number) {
  if (slaStatus === "Escalation Required") return "Escalate immediately";
  if (slaStatus === "Breached") return "Escalate now and confirm recovery owner";
  if (slaStatus === "At Risk") return `Escalate if not recovered within ${remainingHours} hours`;
  return `Review at next checkpoint within ${remainingHours} hours`;
}
