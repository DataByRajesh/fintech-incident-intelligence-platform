import { useEffect, useMemo, useState } from "react";
import { AddIncidentForm } from "./components/AddIncidentForm";
import { ClassificationResult } from "./components/ClassificationResult";
import { Dashboard } from "./components/Dashboard";
import { IncidentTracker } from "./components/IncidentTracker";
import { Reports } from "./components/Reports";
import {
  createIncident,
  generateBusinessImpactReasoning,
  generateStakeholderSummary,
  generateStakeholderUpdateDraft,
  getEscalationRequirement,
  getInvestigationPlaybook,
  getRecommendedAction,
  getReconciliationPriority,
  getReportingNote,
} from "./logic/incidentRules";
import { demoIncidents } from "./data/demoIncidents";
import {
  INCIDENT_CATEGORIES,
  INCIDENT_STATUSES,
  RISK_LABELS,
  SEVERITIES,
  SLA_STATUSES,
  type ImpactLevel,
  type Incident,
  type IncidentDraft,
  type IncidentStatus,
  type PaymentType,
  type WorkaroundAvailability,
} from "./types/incident";

type Screen = "dashboard" | "workbench" | "tracker" | "reports";

const storageKey = "fintech-incident-intelligence-incidents";
const impactLevels: ImpactLevel[] = ["Low", "Medium", "High", "Critical"];
const workaroundOptions: WorkaroundAvailability[] = ["Available", "Partial", "Unavailable"];
const paymentTypes: PaymentType[] = [
  "Faster Payments",
  "Card Payments",
  "Open Banking",
  "BACS",
  "CHAPS",
  "SEPA",
  "SWIFT",
  "Chargeback",
  "Internal Ledger",
  "Other",
];

function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === "string" && options.includes(value as T);
}

function isBaseIncident(value: unknown): value is Incident {
  if (!value || typeof value !== "object") return false;

  const incident = value as Partial<Incident>;
  const requiredText = [
    incident.id,
    incident.reference,
    incident.title,
    incident.description,
    incident.reportedBy,
    incident.affectedService,
    incident.createdAt,
    incident.updatedAt,
  ];

  return (
    requiredText.every((field) => typeof field === "string" && field.trim().length > 0) &&
    typeof incident.riskScore === "number" &&
    Number.isFinite(incident.riskScore) &&
    incident.riskScore >= 0 &&
    incident.riskScore <= 100 &&
    isOneOf(incident.customerImpact, impactLevels) &&
    isOneOf(incident.financialImpact, impactLevels) &&
    isOneOf(incident.slaUrgency, impactLevels) &&
    isOneOf(incident.systemImpact, impactLevels) &&
    isOneOf(incident.complianceSensitivity, impactLevels) &&
    isOneOf(incident.workaroundAvailability, workaroundOptions) &&
    (incident.paymentType === undefined || isOneOf(incident.paymentType, paymentTypes)) &&
    (incident.incidentCategory === undefined || isOneOf(incident.incidentCategory, INCIDENT_CATEGORIES)) &&
    (incident.affectedCustomers === undefined || typeof incident.affectedCustomers === "number") &&
    (incident.transactionCount === undefined || typeof incident.transactionCount === "number") &&
    (incident.estimatedFinancialImpact === undefined || typeof incident.estimatedFinancialImpact === "number") &&
    isOneOf(incident.category, INCIDENT_CATEGORIES) &&
    isOneOf(incident.severity, SEVERITIES) &&
    isOneOf(incident.riskLabel, RISK_LABELS) &&
    isOneOf(incident.slaStatus, SLA_STATUSES) &&
    isOneOf(incident.status, INCIDENT_STATUSES)
  );
}

function normalizeIncident(incident: Incident): Incident {
  const baseIncident = {
    ...incident,
    paymentType: incident.paymentType ?? "Other",
    incidentCategory: incident.incidentCategory ?? incident.category,
    affectedCustomers: Number.isFinite(incident.affectedCustomers) ? incident.affectedCustomers : 1,
    transactionCount: Number.isFinite(incident.transactionCount) ? incident.transactionCount : 1,
    estimatedFinancialImpact: Number.isFinite(incident.estimatedFinancialImpact) ? incident.estimatedFinancialImpact : 0,
    ownerTeam: typeof incident.ownerTeam === "string" && incident.ownerTeam.trim() ? incident.ownerTeam : incident.reportedBy,
    notes: typeof incident.notes === "string" ? incident.notes : "",
  };
  const intelligenceContext = {
    category: baseIncident.category,
    riskLabel: baseIncident.riskLabel,
    riskScore: baseIncident.riskScore,
    slaStatus: baseIncident.slaStatus,
    severity: baseIncident.severity,
  };
  const playbook = getInvestigationPlaybook(baseIncident.category);

  return {
    ...baseIncident,
    stakeholderSummary:
      typeof baseIncident.stakeholderSummary === "string" && baseIncident.stakeholderSummary.trim()
        ? baseIncident.stakeholderSummary
        : generateStakeholderSummary(baseIncident, intelligenceContext),
    businessImpactReasoning:
      typeof baseIncident.businessImpactReasoning === "string" && baseIncident.businessImpactReasoning.trim()
        ? baseIncident.businessImpactReasoning
        : generateBusinessImpactReasoning(baseIncident, intelligenceContext),
    investigationPlaybook:
      Array.isArray(baseIncident.investigationPlaybook) && baseIncident.investigationPlaybook.length > 0
        ? baseIncident.investigationPlaybook
        : playbook.steps,
    rcaHypotheses:
      Array.isArray(baseIncident.rcaHypotheses) && baseIncident.rcaHypotheses.length > 0
        ? baseIncident.rcaHypotheses
        : playbook.rcaHypotheses,
    stakeholderUpdateDraft:
      typeof baseIncident.stakeholderUpdateDraft === "string" && baseIncident.stakeholderUpdateDraft.trim()
        ? baseIncident.stakeholderUpdateDraft
        : generateStakeholderUpdateDraft(baseIncident, intelligenceContext),
    recommendedAction:
      typeof baseIncident.recommendedAction === "string" && baseIncident.recommendedAction.trim()
        ? baseIncident.recommendedAction
        : getRecommendedAction(baseIncident, intelligenceContext),
    escalationRequirement:
      typeof baseIncident.escalationRequirement === "string" && baseIncident.escalationRequirement.trim()
        ? baseIncident.escalationRequirement
        : getEscalationRequirement(intelligenceContext),
    reconciliationPriority:
      typeof baseIncident.reconciliationPriority === "string" && baseIncident.reconciliationPriority.trim()
        ? baseIncident.reconciliationPriority
        : getReconciliationPriority(intelligenceContext),
    reportingNote:
      typeof baseIncident.reportingNote === "string" && baseIncident.reportingNote.trim()
        ? baseIncident.reportingNote
        : getReportingNote(baseIncident, intelligenceContext),
  };
}

function loadIncidents(): Incident[] {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return demoIncidents;
    const parsed = JSON.parse(stored) as unknown;
    return Array.isArray(parsed) && parsed.length > 0 && parsed.every(isBaseIncident)
      ? parsed.map(normalizeIncident)
      : demoIncidents;
  } catch {
    return demoIncidents;
  }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [incidents, setIncidents] = useState<Incident[]>(loadIncidents);
  const [latestIncidentId, setLatestIncidentId] = useState<string | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [persistenceWarning, setPersistenceWarning] = useState("");

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(incidents));
      setPersistenceWarning("");
    } catch {
      setPersistenceWarning("Incident changes are visible now, but could not be saved for refresh.");
    }
  }, [incidents]);

  const latestIncident = useMemo(
    () => incidents.find((incident) => incident.id === latestIncidentId) ?? null,
    [incidents, latestIncidentId],
  );

  function navigate(nextScreen: Screen) {
    setScreen(nextScreen);
    if (nextScreen !== "dashboard") setNotice("");
  }

  function handleIncidentSubmit(draft: IncidentDraft) {
    const incident = createIncident(draft, incidents.length);
    setIncidents((current) => [incident, ...current]);
    setLatestIncidentId(incident.id);
    setSelectedIncidentId(incident.id);
    setNotice(`${incident.reference} logged and classified successfully.`);
    setScreen("workbench");
  }

  function handleStatusUpdate(id: string, status: IncidentStatus) {
    setIncidents((current) =>
      current.map((incident) =>
        incident.id === id ? { ...incident, status, updatedAt: new Date().toISOString() } : incident,
      ),
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">FinTech Operational Resilience</p>
          <h1>Fintech Incident Intelligence & Risk Operations Platform</h1>
        </div>
        <nav className="app-nav" aria-label="Primary">
          {[
            ["dashboard", "Dashboard"],
            ["workbench", "Workbench"],
            ["tracker", "Incident Tracker"],
            ["reports", "Reports"],
          ].map(([key, label]) => (
            <button
              className={screen === key ? "active" : ""}
              key={key}
              onClick={() => navigate(key as Screen)}
              type="button"
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {persistenceWarning ? <div className="error-message app-message">{persistenceWarning}</div> : null}
        {screen === "dashboard" ? (
          <Dashboard incidents={incidents} onNavigate={navigate} notice={notice} />
        ) : null}
        {screen === "workbench" ? (
          <>
            <AddIncidentForm onSubmit={handleIncidentSubmit} />
            <ClassificationResult incident={latestIncident} onNavigate={navigate} />
          </>
        ) : null}
        {screen === "tracker" ? (
          <IncidentTracker
            incidents={incidents}
            selectedIncidentId={selectedIncidentId}
            onSelectIncident={setSelectedIncidentId}
            onUpdateStatus={handleStatusUpdate}
          />
        ) : null}
        {screen === "reports" ? <Reports incidents={incidents} /> : null}
      </main>
    </div>
  );
}
