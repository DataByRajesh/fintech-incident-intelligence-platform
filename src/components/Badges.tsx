import type { IncidentStatus, RiskLabel, Severity, SlaStatus } from "../types/incident";

type BadgeTone = "critical" | "high" | "medium" | "low" | "neutral" | "success" | "warning";

const riskTone: Record<RiskLabel, BadgeTone> = {
  Critical: "critical",
  High: "high",
  Medium: "medium",
  Low: "low",
};

const severityTone: Record<Severity, BadgeTone> = riskTone;

const slaTone: Record<SlaStatus, BadgeTone> = {
  "Escalation Required": "critical",
  Breached: "high",
  "At Risk": "warning",
  "On Track": "success",
};

const statusTone: Record<IncidentStatus, BadgeTone> = {
  Open: "neutral",
  Investigating: "warning",
  Escalated: "high",
  Monitoring: "low",
  Resolved: "success",
  Closed: "success",
};

function Badge({ label, tone }: { label: string; tone: BadgeTone }) {
  return <span className={`badge badge-${tone}`}>{label}</span>;
}

export function RiskBadge({ label }: { label: RiskLabel }) {
  return <Badge label={label} tone={riskTone[label]} />;
}

export function SeverityBadge({ label }: { label: Severity }) {
  return <Badge label={label} tone={severityTone[label]} />;
}

export function SlaBadge({ label }: { label: SlaStatus }) {
  return <Badge label={label} tone={slaTone[label]} />;
}

export function StatusBadge({ label }: { label: IncidentStatus }) {
  return <Badge label={label} tone={statusTone[label]} />;
}
