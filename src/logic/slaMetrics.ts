import type { Incident, IncidentStatus, Severity } from "../types/incident";

export type OperationalSlaStatus = "On Track" | "At Risk" | "Breached";

export interface SlaMetrics {
  ageHours: number;
  ageLabel: string;
  createdLabel: string;
  targetHours: number;
  targetLabel: string;
  status: OperationalSlaStatus;
  isActive: boolean;
  isBreached: boolean;
  isAtRisk: boolean;
  escalationTiming: string;
  recommendation: string;
}

const targetHoursBySeverity: Record<Severity, number> = {
  Critical: 2,
  High: 4,
  Medium: 24,
  Low: 72,
};

const closedStatuses: IncidentStatus[] = ["Resolved", "Closed"];

function parseDate(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Date.now();
}

function formatAge(hours: number) {
  if (hours < 1) return "Opened less than 1 hour ago";
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} open`;
  const days = Math.floor(hours / 24);
  const remainder = hours % 24;
  return remainder === 0
    ? `${days} day${days === 1 ? "" : "s"} open`
    : `${days} day${days === 1 ? "" : "s"} ${remainder} hour${remainder === 1 ? "" : "s"} open`;
}

function getOperationalStatus(ageHours: number, targetHours: number, incidentStatus: IncidentStatus): OperationalSlaStatus {
  if (closedStatuses.includes(incidentStatus)) return "On Track";
  if (ageHours >= targetHours) return "Breached";
  if (ageHours >= targetHours * 0.75) return "At Risk";
  return "On Track";
}

function getRecommendation(status: OperationalSlaStatus, incident: Pick<Incident, "ownerTeam" | "status" | "severity">) {
  if (closedStatuses.includes(incident.status)) return `No active escalation required; incident is ${incident.status}.`;
  if (status === "Breached") return `Escalate now with ${incident.ownerTeam} and confirm recovery ownership.`;
  if (status === "At Risk") return `Prepare escalation with ${incident.ownerTeam} before the SLA target is reached.`;
  if (incident.severity === "Critical" || incident.severity === "High") {
    return `Maintain active monitoring with ${incident.ownerTeam} until the next SLA checkpoint.`;
  }
  return `Continue monitored triage with ${incident.ownerTeam}.`;
}

export function getSlaTargetHours(severity: Severity) {
  return targetHoursBySeverity[severity];
}

export function getSlaMetrics(
  incident: Pick<Incident, "createdAt" | "ownerTeam" | "severity" | "status">,
  now = new Date(),
): SlaMetrics {
  const createdAt = parseDate(incident.createdAt);
  const ageHours = Math.max(0, Math.floor((now.getTime() - createdAt) / 3_600_000));
  const targetHours = getSlaTargetHours(incident.severity);
  const status = getOperationalStatus(ageHours, targetHours, incident.status);
  const hoursRemaining = Math.max(0, targetHours - ageHours);

  return {
    ageHours,
    ageLabel: formatAge(ageHours),
    createdLabel: new Date(createdAt).toLocaleString("en-GB"),
    targetHours,
    targetLabel: `${targetHours} hour${targetHours === 1 ? "" : "s"} target`,
    status,
    isActive: !closedStatuses.includes(incident.status),
    isBreached: status === "Breached",
    isAtRisk: status === "At Risk",
    escalationTiming:
      status === "Breached"
        ? "Escalate immediately"
        : status === "At Risk"
          ? `Escalate if not recovered within ${hoursRemaining} hour${hoursRemaining === 1 ? "" : "s"}`
          : `Review within ${hoursRemaining} hour${hoursRemaining === 1 ? "" : "s"}`,
    recommendation: getRecommendation(status, incident),
  };
}

export function summarizeSlaMetrics(incidents: Incident[], now = new Date()) {
  const activeMetrics = incidents.map((incident) => ({ incident, metrics: getSlaMetrics(incident, now) }));
  const breached = activeMetrics.filter(({ metrics }) => metrics.isActive && metrics.isBreached);
  const atRisk = activeMetrics.filter(({ metrics }) => metrics.isActive && metrics.isAtRisk);
  const nextEscalation = [...breached, ...atRisk].sort((a, b) => b.incident.riskScore - a.incident.riskScore)[0] ?? null;

  return {
    breachedCount: breached.length,
    atRiskCount: atRisk.length,
    nextEscalationRecommendation: nextEscalation
      ? `${nextEscalation.incident.reference}: ${nextEscalation.metrics.recommendation}`
      : "No active SLA escalation is currently required.",
  };
}
