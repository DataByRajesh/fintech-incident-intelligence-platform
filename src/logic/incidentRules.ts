import type {
  ImpactLevel,
  Incident,
  IncidentCategory,
  IncidentDraft,
  RiskLabel,
  Severity,
  SlaStatus,
  WorkaroundAvailability,
} from "../types/incident";

const impactScores: Record<ImpactLevel, number> = {
  Low: 25,
  Medium: 55,
  High: 80,
  Critical: 100,
};

const workaroundScores: Record<WorkaroundAvailability, number> = {
  Available: 20,
  Partial: 60,
  Unavailable: 100,
};

const categoryRules: Array<{ category: IncidentCategory; keywords: string[] }> = [
  {
    category: "Payment Failure",
    keywords: ["charged", "checkout", "card", "payment failed", "declined", "order not confirmed"],
  },
  {
    category: "Transaction Delay",
    keywords: ["pending", "stuck", "delay", "settlement delay", "processing"],
  },
  {
    category: "Account Access Issue",
    keywords: ["blocked", "locked", "login", "access", "cannot sign in"],
  },
  {
    category: "KYC / Verification Issue",
    keywords: ["kyc", "verification", "identity", "approved but", "documents"],
  },
  {
    category: "API Error",
    keywords: ["api", "timeout", "500", "gateway", "provider unavailable", "webhook"],
  },
  {
    category: "Reconciliation Mismatch",
    keywords: ["reconciliation", "ledger", "provider", "mismatch", "variance"],
  },
  {
    category: "Customer Support Escalation",
    keywords: ["complaint", "escalation", "support", "vip", "customer chasing"],
  },
  {
    category: "Data Mismatch",
    keywords: ["data mismatch", "balance sync", "incorrect balance", "sync issue", "out of sync"],
  },
  {
    category: "System Outage",
    keywords: ["outage", "unavailable", "down", "service disruption", "incident bridge"],
  },
  {
    category: "Security-Sensitive Issue",
    keywords: ["security", "fraud", "unauthorised", "unauthorized", "breach", "suspicious"],
  },
  {
    category: "Refund / Settlement Issue",
    keywords: ["refund", "settlement", "payout", "merchant payout", "settled"],
  },
];

export function classifyIncident(draft: Pick<IncidentDraft, "title" | "description">): IncidentCategory {
  const text = `${draft.title} ${draft.description}`.toLowerCase();
  const match = categoryRules.find((rule) => rule.keywords.some((keyword) => text.includes(keyword)));

  return match?.category ?? "Unknown / Needs Review";
}

export function calculateRiskScore(input: IncidentDraft): number {
  const score =
    impactScores[input.customerImpact] * 0.2 +
    impactScores[input.financialImpact] * 0.2 +
    impactScores[input.slaUrgency] * 0.2 +
    impactScores[input.systemImpact] * 0.15 +
    impactScores[input.complianceSensitivity] * 0.15 +
    workaroundScores[input.workaroundAvailability] * 0.1;

  return Math.round(score);
}

export function getRiskLabel(score: number): RiskLabel {
  if (score >= 81) return "Critical";
  if (score >= 61) return "High";
  if (score >= 31) return "Medium";
  return "Low";
}

export function getSeverity(score: number): Severity {
  if (score >= 81) return "Critical";
  if (score >= 61) return "High";
  if (score >= 31) return "Medium";
  return "Low";
}

export function calculateSlaStatus(input: IncidentDraft, riskScore: number): SlaStatus {
  if (input.slaUrgency === "Critical" || riskScore >= 81) return "Escalation Required";
  if (input.slaUrgency === "High" || riskScore >= 70) return "Breached";
  if (input.slaUrgency === "Medium" || riskScore >= 50) return "At Risk";
  return "On Track";
}

export function generateStakeholderSummary(input: IncidentDraft, incident: Pick<Incident, "category" | "riskLabel" | "riskScore" | "slaStatus" | "severity">): string {
  return `${incident.severity} ${incident.category.toLowerCase()} incident affecting ${input.affectedService}. Risk is ${incident.riskLabel.toLowerCase()} at ${incident.riskScore}/100 with SLA status "${incident.slaStatus}". Current user impact: ${input.customerImpact.toLowerCase()}; financial impact: ${input.financialImpact.toLowerCase()}; workaround: ${input.workaroundAvailability.toLowerCase()}. Recommended action: triage with product/support owners, confirm customer and financial exposure, and provide stakeholder updates until service risk is reduced.`;
}

export function createIncident(draft: IncidentDraft, existingCount: number): Incident {
  const now = new Date().toISOString();
  const riskScore = calculateRiskScore(draft);
  const category = classifyIncident(draft);
  const riskLabel = getRiskLabel(riskScore);
  const severity = getSeverity(riskScore);
  const slaStatus = calculateSlaStatus(draft, riskScore);
  const partialIncident = { category, riskLabel, riskScore, slaStatus, severity };

  return {
    ...draft,
    id: crypto.randomUUID(),
    reference: `FIN-${String(existingCount + 1).padStart(4, "0")}`,
    category,
    severity,
    riskScore,
    riskLabel,
    slaStatus,
    status: "Open",
    stakeholderSummary: generateStakeholderSummary(draft, partialIncident),
    createdAt: now,
    updatedAt: now,
  };
}
