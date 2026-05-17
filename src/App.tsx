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
type IncidentStore = { version: 2; incidents: Incident[] };
type LegacyIncidentStatus = "Open" | "Investigating" | "Monitoring";

const storageKey = "fintech-incident-intelligence-incidents";
const storageVersion = 2;
const impactLevels: ImpactLevel[] = ["Low", "Medium", "High", "Critical"];
const workaroundOptions: WorkaroundAvailability[] = ["Available", "Partial", "Unavailable"];
const paymentTypes: PaymentType[] = [
  "Faster Payments",
  "BACS",
  "CHAPS",
  "Card",
  "Open Banking",
  "SWIFT",
  "SEPA",
];

function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === "string" && options.includes(value as T);
}

function normalizeStatus(value: unknown): IncidentStatus {
  const legacyStatusMap: Record<LegacyIncidentStatus, IncidentStatus> = {
    Open: "New",
    Investigating: "Under Review",
    Monitoring: "Awaiting Reconciliation",
  };

  if (isOneOf(value, INCIDENT_STATUSES)) return value;
  if (isOneOf(value, ["Open", "Investigating", "Monitoring"] as const)) return legacyStatusMap[value];
  return "New";
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
    (incident.auditTrail === undefined ||
      (Array.isArray(incident.auditTrail) &&
        incident.auditTrail.every(
          (entry) =>
            entry &&
            typeof entry === "object" &&
            (isOneOf((entry as { status?: unknown }).status, INCIDENT_STATUSES) ||
              isOneOf((entry as { status?: unknown }).status, ["Open", "Investigating", "Monitoring"] as const)) &&
            typeof (entry as { actor?: unknown }).actor === "string" &&
            typeof (entry as { note?: unknown }).note === "string" &&
            typeof (entry as { timestamp?: unknown }).timestamp === "string",
        ))) &&
    isOneOf(incident.category, INCIDENT_CATEGORIES) &&
    isOneOf(incident.severity, SEVERITIES) &&
    isOneOf(incident.riskLabel, RISK_LABELS) &&
    isOneOf(incident.slaStatus, SLA_STATUSES) &&
    (isOneOf(incident.status, INCIDENT_STATUSES) ||
      isOneOf(incident.status, ["Open", "Investigating", "Monitoring"] as const))
  );
}

function normalizeIncident(incident: Incident): Incident {
  const updatedAt = typeof incident.updatedAt === "string" ? incident.updatedAt : incident.createdAt;
  const baseIncident = {
    ...incident,
    paymentType: incident.paymentType ?? "Faster Payments",
    incidentCategory: incident.incidentCategory ?? incident.category,
    affectedCustomers: Number.isFinite(incident.affectedCustomers) ? incident.affectedCustomers : 1,
    transactionCount: Number.isFinite(incident.transactionCount) ? incident.transactionCount : 1,
    estimatedFinancialImpact: Number.isFinite(incident.estimatedFinancialImpact) ? incident.estimatedFinancialImpact : 0,
    ownerTeam: typeof incident.ownerTeam === "string" && incident.ownerTeam.trim() ? incident.ownerTeam : incident.reportedBy,
    notes: typeof incident.notes === "string" ? incident.notes : "",
    status: normalizeStatus(incident.status),
    updatedAt,
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
    auditTrail:
      Array.isArray(baseIncident.auditTrail) && baseIncident.auditTrail.length > 0
        ? baseIncident.auditTrail.map((entry) => ({ ...entry, status: normalizeStatus(entry.status) }))
        : [
            {
              action: "Migrated",
              status: baseIncident.status,
              actor: "System",
              note: "Existing incident normalized into the production data contract.",
              timestamp: updatedAt,
            },
          ],
  };
}

function readIncidentStore(parsed: unknown): Incident[] | null {
  if (Array.isArray(parsed)) return parsed.every(isBaseIncident) ? parsed.map(normalizeIncident) : null;

  if (!parsed || typeof parsed !== "object") return null;

  const store = parsed as Partial<IncidentStore>;
  return store.version === storageVersion && Array.isArray(store.incidents) && store.incidents.every(isBaseIncident)
    ? store.incidents.map(normalizeIncident)
    : null;
}

function loadIncidents(): Incident[] {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return demoIncidents;
    const parsed = JSON.parse(stored) as unknown;
    return readIncidentStore(parsed) ?? demoIncidents;
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
      window.localStorage.setItem(storageKey, JSON.stringify({ version: storageVersion, incidents }));
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
      current.map((incident) => {
        if (incident.id !== id) return incident;

        const timestamp = new Date().toISOString();
        return {
          ...incident,
          status,
          updatedAt: timestamp,
          auditTrail: [
            {
              action: "Status changed",
              status,
              actor: "Operations user",
              note: `Status changed from ${incident.status} to ${status}.`,
              timestamp,
            },
            ...incident.auditTrail,
          ],
        };
      }),
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
              aria-current={screen === key ? "page" : undefined}
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
            {notice ? <div className="success-message app-message">{notice}</div> : null}
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
