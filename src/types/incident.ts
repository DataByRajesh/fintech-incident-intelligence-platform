export const INCIDENT_STATUSES = [
  "Open",
  "Investigating",
  "Escalated",
  "Monitoring",
  "Resolved",
  "Closed",
] as const;

export const SEVERITIES = ["Critical", "High", "Medium", "Low"] as const;

export const RISK_LABELS = ["Critical", "High", "Medium", "Low"] as const;

export const SLA_STATUSES = [
  "On Track",
  "At Risk",
  "Breached",
  "Escalation Required",
] as const;

export const INCIDENT_CATEGORIES = [
  "Payment Failure",
  "Transaction Delay",
  "Account Access Issue",
  "KYC / Verification Issue",
  "API Error",
  "Reconciliation Mismatch",
  "Customer Support Escalation",
  "Data Mismatch",
  "System Outage",
  "Security-Sensitive Issue",
  "Refund / Settlement Issue",
  "Unknown / Needs Review",
] as const;

export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];
export type Severity = (typeof SEVERITIES)[number];
export type RiskLabel = (typeof RISK_LABELS)[number];
export type SlaStatus = (typeof SLA_STATUSES)[number];
export type IncidentCategory = (typeof INCIDENT_CATEGORIES)[number];

export type ImpactLevel = "Low" | "Medium" | "High" | "Critical";
export type WorkaroundAvailability = "Available" | "Partial" | "Unavailable";

export interface RiskInputs {
  customerImpact: ImpactLevel;
  financialImpact: ImpactLevel;
  slaUrgency: ImpactLevel;
  systemImpact: ImpactLevel;
  complianceSensitivity: ImpactLevel;
  workaroundAvailability: WorkaroundAvailability;
}

export interface IncidentDraft extends RiskInputs {
  title: string;
  description: string;
  reportedBy: string;
  affectedService: string;
}

export interface InvestigationPlaybook {
  steps: string[];
  rcaHypotheses: string[];
}

export interface RepeatedPatternInsight {
  category: IncidentCategory;
  count: number;
  opportunity: string;
  followUp: string;
}

export interface Incident extends IncidentDraft {
  id: string;
  reference: string;
  category: IncidentCategory;
  severity: Severity;
  riskScore: number;
  riskLabel: RiskLabel;
  slaStatus: SlaStatus;
  status: IncidentStatus;
  stakeholderSummary: string;
  businessImpactReasoning: string;
  investigationPlaybook: string[];
  rcaHypotheses: string[];
  stakeholderUpdateDraft: string;
  createdAt: string;
  updatedAt: string;
}
