export const INCIDENT_STATUSES = [
  "New",
  "Under Review",
  "Escalated",
  "Awaiting Reconciliation",
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
  "Settlement Delay",
  "Account Access Issue",
  "KYC / Verification Issue",
  "API Error",
  "Reconciliation Mismatch",
  "Duplicate Debit",
  "Chargeback Spike",
  "File Processing Exception",
  "Suspicious Transaction Alert",
  "High-Value Payment Delay",
  "Payment Investigation",
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
export type PaymentType =
  | "Faster Payments"
  | "BACS"
  | "CHAPS"
  | "Card"
  | "Open Banking"
  | "SWIFT"
  | "SEPA";

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
  paymentType: PaymentType;
  incidentCategory: IncidentCategory;
  affectedCustomers: number;
  transactionCount: number;
  estimatedFinancialImpact: number;
  ownerTeam: string;
  notes: string;
}

export interface IncidentAuditEntry {
  action: "Created" | "Status changed" | "Migrated";
  status: IncidentStatus;
  actor: string;
  note: string;
  timestamp: string;
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
  recommendedAction: string;
  escalationRequirement: string;
  reconciliationPriority: string;
  reportingNote: string;
  auditTrail: IncidentAuditEntry[];
  createdAt: string;
  updatedAt: string;
}
