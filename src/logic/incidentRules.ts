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
  Low: 20,
  Medium: 45,
  High: 75,
  Critical: 100,
};

const workaroundScores: Record<WorkaroundAvailability, number> = {
  Available: 15,
  Partial: 55,
  Unavailable: 100,
};

const categoryScores: Partial<Record<IncidentCategory, number>> = {
  "Duplicate Debit": 100,
  "Suspicious Transaction Alert": 100,
  "High-Value Payment Delay": 95,
  "Reconciliation Mismatch": 90,
  "Settlement Delay": 85,
  "Chargeback Spike": 85,
  "Payment Investigation": 85,
  "File Processing Exception": 80,
  "Payment Failure": 78,
  "Refund / Settlement Issue": 76,
  "Transaction Delay": 70,
  "API Error": 66,
  "Data Mismatch": 64,
};

const categoryRules: Array<{ category: IncidentCategory; keywords: string[] }> = [
  {
    category: "Duplicate Debit",
    keywords: ["duplicate debit", "double charged", "charged twice", "duplicate customer debit", "duplicate capture"],
  },
  {
    category: "Chargeback Spike",
    keywords: ["chargeback spike", "chargebacks", "dispute spike", "scheme dispute", "retrieval request"],
  },
  {
    category: "Suspicious Transaction Alert",
    keywords: ["suspicious", "fraud", "unauthorised", "unauthorized", "aml", "sanctions", "security"],
  },
  {
    category: "High-Value Payment Delay",
    keywords: ["chaps", "high-value", "high value", "treasury payment", "large value"],
  },
  {
    category: "File Processing Exception",
    keywords: ["bacs", "file processing", "payment file", "file exception", "batch rejected"],
  },
  {
    category: "Payment Investigation",
    keywords: ["swift", "payment investigation", "correspondent", "mt103", "gpi", "trace payment"],
  },
  {
    category: "Settlement Delay",
    keywords: ["settlement delay", "faster payments settlement", "sepa settlement", "settlement exception", "payout delay"],
  },
  {
    category: "Reconciliation Mismatch",
    keywords: ["reconciliation", "ledger", "provider", "mismatch", "variance", "break", "unmatched"],
  },
  {
    category: "Payment Failure",
    keywords: ["charged", "checkout", "card", "payment failed", "declined", "order not confirmed"],
  },
  {
    category: "Transaction Delay",
    keywords: ["pending", "stuck", "delay", "processing", "callback delay"],
  },
  {
    category: "API Error",
    keywords: ["api", "timeout", "500", "gateway", "provider unavailable", "webhook", "open banking"],
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
    category: "Refund / Settlement Issue",
    keywords: ["refund", "settlement", "payout", "merchant payout", "settled"],
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
    category: "Customer Support Escalation",
    keywords: ["complaint", "escalation", "support", "vip", "customer chasing"],
  },
];

const reconciliationCategories: IncidentCategory[] = [
  "Reconciliation Mismatch",
  "Settlement Delay",
  "Duplicate Debit",
  "Chargeback Spike",
  "File Processing Exception",
  "High-Value Payment Delay",
  "Payment Investigation",
  "Refund / Settlement Issue",
  "Data Mismatch",
];

const defaultPlaybook: InvestigationPlaybook = {
  steps: [
    "Confirm incident scope, impacted payment flow, start time, customer exposure, and current operational owner.",
    "Compare provider, ledger, settlement, and customer-facing records for the affected time window.",
    "Agree containment, customer handling, reconciliation ownership, and the next management update.",
  ],
  rcaHypotheses: [
    "Provider, ledger, or callback state is not aligned with internal transaction records.",
    "A batch, file, or asynchronous process created a delayed or incomplete payment state.",
    "Operational controls detected a variance that needs reconciliation before customer or ledger correction.",
  ],
};

const categoryPlaybooks: Partial<Record<IncidentCategory, InvestigationPlaybook>> = {
  "Settlement Delay": {
    steps: [
      "Validate settlement file status, scheme cut-off timing, and provider acknowledgement.",
      "Compare expected settlement totals against ledger and bank/provider reports.",
      "Identify merchants, customers, or batches that need proactive communication.",
      "Confirm whether manual settlement monitoring or finance operations escalation is required.",
    ],
    rcaHypotheses: [
      "Scheme or provider settlement file was delayed, rejected, or acknowledged late.",
      "Internal settlement status did not update after provider confirmation.",
      "Batch timing or cut-off handling caused payments to miss the expected settlement window.",
    ],
  },
  "Reconciliation Mismatch": {
    steps: [
      "Compare ledger, provider, bank, and settlement totals for the impacted period.",
      "Identify unmatched transaction IDs, missing callbacks, duplicates, reversals, or timing differences.",
      "Quantify exposure before any balance, settlement, or reporting adjustment.",
      "Agree finance operations ownership for reconciliation closure and evidence capture.",
    ],
    rcaHypotheses: [
      "Provider settlement report differs from internal ledger timing or status mapping.",
      "Duplicate, missing, or delayed transaction event created a ledger variance.",
      "Refund, chargeback, reversal, or adjustment flow was not represented consistently.",
    ],
  },
  "Duplicate Debit": {
    steps: [
      "Identify duplicate authorisation, capture, and ledger entries for affected customers.",
      "Confirm whether funds were captured twice or only duplicated in customer-facing status.",
      "Define reversal/refund handling and customer communication before wider closure.",
      "Check retry, timeout, and idempotency controls for the affected payment flow.",
    ],
    rcaHypotheses: [
      "Retry or timeout behavior bypassed idempotency controls.",
      "Provider callback was processed more than once.",
      "Ledger and customer-facing payment state diverged after duplicate event handling.",
    ],
  },
  "Chargeback Spike": {
    steps: [
      "Segment chargebacks by merchant, card scheme, reason code, and transaction period.",
      "Check fraud, fulfilment, refund, and customer complaint patterns.",
      "Confirm operational exposure and whether scheme thresholds or monitoring limits are at risk.",
      "Prepare a management summary covering trend, exposure, and immediate controls.",
    ],
    rcaHypotheses: [
      "Merchant fulfilment or descriptor issue triggered elevated customer disputes.",
      "Fraud or account takeover pattern increased chargeback volume.",
      "Refund or cancellation handling caused customers to dispute transactions.",
    ],
  },
  "File Processing Exception": {
    steps: [
      "Validate file receipt, format, control totals, and processing status.",
      "Compare accepted, rejected, and pending records against expected batch totals.",
      "Confirm whether payment release, customer credit, or settlement reporting is blocked.",
      "Coordinate remediation with operations before reprocessing any file.",
    ],
    rcaHypotheses: [
      "Payment file failed validation or contained unexpected control totals.",
      "Batch processing job stopped before posting all records.",
      "File acknowledgement was not reconciled back to internal records.",
    ],
  },
  "High-Value Payment Delay": {
    steps: [
      "Confirm payment status, value date, beneficiary details, and scheme/provider status.",
      "Escalate ownership because high-value payment delays may require direct stakeholder updates.",
      "Check sanctions, fraud, liquidity, cut-off, and correspondent bank indicators.",
      "Prepare a concise update covering current state, exposure, and next checkpoint.",
    ],
    rcaHypotheses: [
      "Payment is held for sanctions, fraud, liquidity, or manual repair review.",
      "Scheme, bank, or provider cut-off timing delayed settlement.",
      "Beneficiary or correspondent bank routing details require investigation.",
    ],
  },
  "Payment Investigation": {
    steps: [
      "Collect payment reference, correspondent trace data, value date, and beneficiary bank details.",
      "Review provider, correspondent, and internal investigation notes.",
      "Confirm customer communication approach and next expected update point.",
      "Track the investigation until final payment status and funds location are confirmed.",
    ],
    rcaHypotheses: [
      "Correspondent bank processing delay or request for additional information.",
      "Routing, beneficiary, or compliance review exception.",
      "Provider status is not synchronized with internal payment investigation records.",
    ],
  },
};

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function financialScore(amount: number) {
  if (amount >= 250000) return 100;
  if (amount >= 50000) return 85;
  if (amount >= 10000) return 70;
  if (amount >= 1000) return 45;
  return 20;
}

function volumeScore(count: number) {
  if (count >= 5000) return 100;
  if (count >= 1000) return 85;
  if (count >= 250) return 70;
  if (count >= 50) return 50;
  if (count >= 1) return 25;
  return 10;
}

function customerScore(count: number) {
  if (count >= 1000) return 100;
  if (count >= 250) return 85;
  if (count >= 50) return 70;
  if (count >= 10) return 45;
  if (count >= 1) return 25;
  return 10;
}

export function classifyIncident(draft: Pick<IncidentDraft, "title" | "description" | "incidentCategory">): IncidentCategory {
  if (draft.incidentCategory !== "Unknown / Needs Review") return draft.incidentCategory;

  const text = `${draft.title} ${draft.description}`.toLowerCase();
  const match = categoryRules.find((rule) => rule.keywords.some((keyword) => text.includes(keyword)));

  return match?.category ?? "Unknown / Needs Review";
}

export function calculateRiskScore(input: IncidentDraft): number {
  const category = classifyIncident(input);
  const score =
    financialScore(input.estimatedFinancialImpact) * 0.24 +
    customerScore(input.affectedCustomers) * 0.18 +
    volumeScore(input.transactionCount) * 0.16 +
    impactScores[input.slaUrgency] * 0.16 +
    impactScores[input.customerImpact] * 0.1 +
    impactScores[input.complianceSensitivity] * 0.1 +
    (categoryScores[category] ?? 50) * 0.04 +
    workaroundScores[input.workaroundAvailability] * 0.02;

  return clampScore(score);
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
  if (input.slaUrgency === "Critical" || riskScore >= 86) return "Escalation Required";
  if (input.slaUrgency === "High" || riskScore >= 70) return "Breached";
  if (input.slaUrgency === "Medium" || riskScore >= 50) return "At Risk";
  return "On Track";
}

export function getInvestigationPlaybook(category: IncidentCategory): InvestigationPlaybook {
  return categoryPlaybooks[category] ?? defaultPlaybook;
}

export function isReconciliationRisk(incident: Pick<Incident, "category">) {
  return reconciliationCategories.includes(incident.category);
}

export function getRecommendedAction(input: IncidentDraft, incident: Pick<Incident, "category" | "severity" | "slaStatus">): string {
  if (incident.severity === "Critical" || incident.slaStatus === "Escalation Required") {
    return `Open an incident bridge with ${input.ownerTeam}, validate customer and ledger exposure, and issue a management update before the next checkpoint.`;
  }

  if (isReconciliationRisk({ category: incident.category })) {
    return `Assign reconciliation ownership to ${input.ownerTeam}, compare provider and ledger records, and hold closure until the break is explained.`;
  }

  return `Continue triage with ${input.ownerTeam}, confirm scope, monitor customer impact, and update stakeholders when the next action is complete.`;
}

export function getEscalationRequirement(incident: Pick<Incident, "riskLabel" | "slaStatus" | "category">): string {
  if (incident.slaStatus === "Escalation Required" || incident.riskLabel === "Critical") {
    return "Executive and operational escalation required.";
  }
  if (incident.slaStatus === "Breached" || incident.riskLabel === "High") {
    return "Operational escalation required with active owner updates.";
  }
  if (isReconciliationRisk({ category: incident.category })) {
    return "Reconciliation owner review required before closure.";
  }
  return "No formal escalation required; continue monitored triage.";
}

export function getReconciliationPriority(incident: Pick<Incident, "category" | "riskLabel">): string {
  if (!isReconciliationRisk({ category: incident.category })) return "Standard triage";
  if (incident.riskLabel === "Critical") return "Critical reconciliation break";
  if (incident.riskLabel === "High") return "High-priority reconciliation review";
  return "Reconciliation monitoring";
}

export function getReportingNote(input: IncidentDraft, incident: Pick<Incident, "category" | "riskScore" | "slaStatus">): string {
  return `${incident.category} on ${input.paymentType}: ${input.transactionCount} transactions, ${input.affectedCustomers} affected customers, estimated exposure GBP ${input.estimatedFinancialImpact.toLocaleString("en-GB")}, SLA status "${incident.slaStatus}", risk score ${incident.riskScore}/100.`;
}

export function generateStakeholderSummary(
  input: IncidentDraft,
  incident: Pick<Incident, "category" | "riskLabel" | "riskScore" | "slaStatus" | "severity">,
): string {
  return `${incident.severity} ${incident.category.toLowerCase()} affecting ${input.paymentType} and ${input.affectedService}. Risk is ${incident.riskLabel.toLowerCase()} at ${incident.riskScore}/100 with SLA status "${incident.slaStatus}". Estimated exposure is GBP ${input.estimatedFinancialImpact.toLocaleString("en-GB")} across ${input.transactionCount} transactions and ${input.affectedCustomers} customers. Owner: ${input.ownerTeam}.`;
}

export function generateBusinessImpactReasoning(
  input: IncidentDraft,
  incident: Pick<Incident, "category" | "riskLabel" | "riskScore" | "slaStatus" | "severity">,
): string {
  return `The incident is classified as ${incident.category} because it affects ${input.paymentType} operations and ${input.affectedService}. Priority is driven by estimated financial exposure of GBP ${input.estimatedFinancialImpact.toLocaleString("en-GB")}, ${input.affectedCustomers} affected customers, ${input.transactionCount} transactions, SLA risk "${input.slaUrgency}", and regulatory/customer impact "${input.complianceSensitivity}". The resulting severity is ${incident.severity.toLowerCase()} with ${incident.riskLabel.toLowerCase()} risk.`;
}

export function generateStakeholderUpdateDraft(
  input: IncidentDraft,
  incident: Pick<Incident, "category" | "riskLabel" | "riskScore" | "slaStatus" | "severity">,
): string {
  return `Management update: ${input.title} is under review by ${input.ownerTeam}. Current classification is ${incident.category} on ${input.paymentType}, severity ${incident.severity}, risk ${incident.riskLabel} (${incident.riskScore}/100), SLA status "${incident.slaStatus}". Current known exposure is GBP ${input.estimatedFinancialImpact.toLocaleString("en-GB")} across ${input.transactionCount} transactions and ${input.affectedCustomers} customers. Next action: validate reconciliation evidence, confirm customer impact, and provide the next update once ownership and remediation steps are confirmed.`;
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
      opportunity: `Repeated ${category.toLowerCase()} incidents suggest a control, monitoring, provider, or reconciliation process review.`,
      followUp: "BA/product follow-up: map the affected payment journey, confirm common triggers, and define a prevention or detection improvement.",
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
  const category = classifyIncident(draft);
  const riskScore = calculateRiskScore({ ...draft, incidentCategory: category });
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
    recommendedAction: getRecommendedAction(draft, { category, severity, slaStatus }),
    escalationRequirement: getEscalationRequirement({ category, riskLabel, slaStatus }),
    reconciliationPriority: getReconciliationPriority({ category, riskLabel }),
    reportingNote: getReportingNote(draft, { category, riskScore, slaStatus }),
    createdAt: now,
    updatedAt: now,
  };
}
