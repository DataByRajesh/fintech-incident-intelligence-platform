import type {
  ImpactLevel,
  Incident,
  IncidentCategory,
  IncidentDraft,
  InvestigationPlaybook,
  RepeatedPatternInsight,
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

const defaultPlaybook: InvestigationPlaybook = {
  steps: [
    "Confirm the incident scope, affected service, start time, and current customer impact.",
    "Review application logs, monitoring dashboards, recent deployments, and support contacts.",
    "Validate whether a workaround exists and agree the next owner for triage updates.",
  ],
  rcaHypotheses: [
    "Recent service, configuration, or dependency change introduced unexpected behavior.",
    "Upstream/downstream dependency degradation is affecting the user-facing workflow.",
    "Data or process state has moved out of sync and needs targeted reconciliation.",
  ],
};

const categoryPlaybooks: Partial<Record<IncidentCategory, InvestigationPlaybook>> = {
  "Payment Failure": {
    steps: [
      "Check payment provider status, decline/error codes, and authorisation response patterns.",
      "Compare successful and failed checkout attempts by merchant, card type, and time window.",
      "Confirm whether funds were captured, authorised only, or require reversal/refund handling.",
      "Coordinate customer support messaging for charged-but-unconfirmed customers.",
    ],
    rcaHypotheses: [
      "Payment provider authorisation or callback failure.",
      "Checkout/order service did not persist confirmation after payment response.",
      "Network timeout or retry behavior created duplicate or incomplete payment states.",
    ],
  },
  "API Error": {
    steps: [
      "Review API error rates, latency, response codes, and provider/webhook logs.",
      "Check recent deployments, configuration changes, certificates, and rate limits.",
      "Replay or inspect failed requests with correlation IDs where available.",
      "Confirm fallback behavior and customer-facing impact while the dependency is investigated.",
    ],
    rcaHypotheses: [
      "Upstream provider outage, throttling, or degraded response time.",
      "Internal API contract, authentication, certificate, or payload mismatch.",
      "Recent deployment introduced an integration regression.",
    ],
  },
  "KYC / Verification Issue": {
    steps: [
      "Compare KYC provider decision status with internal account state.",
      "Review onboarding events, document checks, rules outcomes, and manual review queues.",
      "Identify whether the issue affects one customer, a cohort, or a provider batch.",
      "Agree whether operations can safely unblock affected accounts after validation.",
    ],
    rcaHypotheses: [
      "KYC provider status was not synced back into the account platform.",
      "Rules engine or manual review queue left the account in an inconsistent state.",
      "Identity verification event processing was delayed or failed.",
    ],
  },
  "Reconciliation Mismatch": {
    steps: [
      "Compare ledger, provider, and settlement totals for the affected period.",
      "Identify mismatched transaction IDs, missing callbacks, reversals, or duplicate entries.",
      "Confirm whether customer balances, merchant payouts, or finance reporting are affected.",
      "Agree remediation steps with finance operations before making balance adjustments.",
    ],
    rcaHypotheses: [
      "Provider settlement report differs from internal ledger timing or status mapping.",
      "Duplicate, missing, or delayed transaction event created a ledger variance.",
      "Refund, chargeback, or reversal flow was not represented consistently.",
    ],
  },
  "Account Access Issue": {
    steps: [
      "Check authentication, account state, device/session, and lockout indicators.",
      "Review recent account, KYC, fraud, or support actions that may block access.",
      "Confirm affected customer segment and whether the issue is isolated or widespread.",
      "Define safe support steps for access recovery or account state correction.",
    ],
    rcaHypotheses: [
      "Account state is blocked or locked despite a valid customer status.",
      "Authentication/session service degradation is preventing access.",
      "Fraud, KYC, or support workflow changed access permissions unexpectedly.",
    ],
  },
  "System Outage": {
    steps: [
      "Confirm service availability, incident bridge status, and monitoring alerts.",
      "Review infrastructure, deployment, dependency, and capacity signals.",
      "Assess customer-facing impact and whether critical journeys are unavailable.",
      "Establish update cadence and escalation ownership until service recovery.",
    ],
    rcaHypotheses: [
      "Infrastructure or hosting dependency failure.",
      "Capacity saturation or resource exhaustion.",
      "Recent release or configuration change degraded a critical service.",
    ],
  },
  "Refund / Settlement Issue": {
    steps: [
      "Check refund, payout, or settlement status across internal and provider records.",
      "Identify affected merchants/customers, settlement batches, and expected payment dates.",
      "Review provider files, callbacks, payout holds, and finance operations queues.",
      "Prepare customer or merchant messaging if funds movement is delayed.",
    ],
    rcaHypotheses: [
      "Provider settlement or payout file was delayed or rejected.",
      "Refund workflow did not complete across all internal and provider systems.",
      "Finance operations hold, risk rule, or batch processing issue paused funds movement.",
    ],
  },
  "Transaction Delay": {
    steps: [
      "Identify delayed transaction states, queues, callbacks, and processing timestamps.",
      "Compare provider status with internal transaction state for affected records.",
      "Check retry jobs, queue backlogs, and downstream settlement dependencies.",
      "Confirm customer impact and whether manual correction or monitoring is needed.",
    ],
    rcaHypotheses: [
      "Provider callback or asynchronous processing delay.",
      "Queue backlog or retry job failure slowed transaction state progression.",
      "Internal and provider transaction statuses are temporarily out of sync.",
    ],
  },
};

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

export function getInvestigationPlaybook(category: IncidentCategory): InvestigationPlaybook {
  return categoryPlaybooks[category] ?? defaultPlaybook;
}

export function generateBusinessImpactReasoning(
  input: IncidentDraft,
  incident: Pick<Incident, "category" | "riskLabel" | "riskScore" | "slaStatus" | "severity">,
): string {
  return `What happened: ${input.description.trim()} This has been classified as a ${incident.category.toLowerCase()} affecting ${input.affectedService}. Who may be affected: customers, operations teams, and stakeholders connected to ${input.affectedService}. Business impact: customer impact is ${input.customerImpact.toLowerCase()}, financial impact is ${input.financialImpact.toLowerCase()}, system impact is ${input.systemImpact.toLowerCase()}, and compliance sensitivity is ${input.complianceSensitivity.toLowerCase()}. Priority justification: the incident is ${incident.severity.toLowerCase()} with a ${incident.riskLabel.toLowerCase()} risk score of ${incident.riskScore}/100 and SLA status "${incident.slaStatus}". Next action: validate scope, confirm exposure, use the investigation playbook, and provide regular stakeholder updates until risk is reduced.`;
}

export function generateStakeholderUpdateDraft(
  input: IncidentDraft,
  incident: Pick<Incident, "category" | "riskLabel" | "riskScore" | "slaStatus" | "severity">,
): string {
  const escalationNote =
    incident.slaStatus === "Escalation Required" || incident.slaStatus === "Breached"
      ? " Escalation should remain active until ownership, impact, and recovery actions are confirmed."
      : " No formal escalation is indicated yet, but the incident should remain under active review.";

  return `Issue summary: ${input.title} is affecting ${input.affectedService} and is classified as ${incident.category}. Current risk level: ${incident.riskLabel} (${incident.riskScore}/100), with SLA status "${incident.slaStatus}". Business impact: customer impact is ${input.customerImpact.toLowerCase()}, financial impact is ${input.financialImpact.toLowerCase()}, and workaround availability is ${input.workaroundAvailability.toLowerCase()}. Next action: continue triage, confirm customer and financial exposure, and share the next update after investigation progress is confirmed.${escalationNote}`;
}

export function getRepeatedPatternInsights(incidents: Incident[]): RepeatedPatternInsight[] {
  return Object.entries(
    incidents.reduce<Partial<Record<IncidentCategory, number>>>((counts, incident) => {
      counts[incident.category] = (counts[incident.category] ?? 0) + 1;
      return counts;
    }, {}),
  )
    .filter(([, count]) => (count ?? 0) > 1)
    .map(([category, count]) => ({
      category: category as IncidentCategory,
      count: count ?? 0,
      opportunity: `Repeated ${category.toLowerCase()} incidents suggest an opportunity to review controls, monitoring, and upstream process quality.`,
      followUp: `BA/product follow-up: map the affected journey, confirm common triggers, and define a prevention or detection improvement backlog item.`,
    }))
    .sort((a, b) => b.count - a.count);
}

function createIncidentId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `incident-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createIncident(draft: IncidentDraft, existingCount: number): Incident {
  const now = new Date().toISOString();
  const riskScore = calculateRiskScore(draft);
  const category = classifyIncident(draft);
  const riskLabel = getRiskLabel(riskScore);
  const severity = getSeverity(riskScore);
  const slaStatus = calculateSlaStatus(draft, riskScore);
  const partialIncident = { category, riskLabel, riskScore, slaStatus, severity };
  const playbook = getInvestigationPlaybook(category);

  return {
    ...draft,
    id: createIncidentId(),
    reference: `FIN-${String(existingCount + 1).padStart(4, "0")}`,
    category,
    severity,
    riskScore,
    riskLabel,
    slaStatus,
    status: "Open",
    stakeholderSummary: generateStakeholderSummary(draft, partialIncident),
    businessImpactReasoning: generateBusinessImpactReasoning(draft, partialIncident),
    investigationPlaybook: playbook.steps,
    rcaHypotheses: playbook.rcaHypotheses,
    stakeholderUpdateDraft: generateStakeholderUpdateDraft(draft, partialIncident),
    createdAt: now,
    updatedAt: now,
  };
}
