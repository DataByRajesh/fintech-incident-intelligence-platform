import { useEffect, useMemo, useState } from "react";
import { AddIncidentForm } from "./components/AddIncidentForm";
import { ClassificationResult } from "./components/ClassificationResult";
import { Dashboard } from "./components/Dashboard";
import { IncidentTracker } from "./components/IncidentTracker";
import { Reports } from "./components/Reports";
import {
  createIncident,
  generateBusinessImpactReasoning,
  generateStakeholderUpdateDraft,
  getInvestigationPlaybook,
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
  type WorkaroundAvailability,
} from "./types/incident";

type Screen = "dashboard" | "add" | "result" | "tracker" | "reports";

const storageKey = "fintech-incident-intelligence-incidents";
const impactLevels: ImpactLevel[] = ["Low", "Medium", "High", "Critical"];
const workaroundOptions: WorkaroundAvailability[] = ["Available", "Partial", "Unavailable"];

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
    incident.stakeholderSummary,
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
    isOneOf(incident.category, INCIDENT_CATEGORIES) &&
    isOneOf(incident.severity, SEVERITIES) &&
    isOneOf(incident.riskLabel, RISK_LABELS) &&
    isOneOf(incident.slaStatus, SLA_STATUSES) &&
    isOneOf(incident.status, INCIDENT_STATUSES)
  );
}

function normalizeIncident(incident: Incident): Incident {
  const intelligenceContext = {
    category: incident.category,
    riskLabel: incident.riskLabel,
    riskScore: incident.riskScore,
    slaStatus: incident.slaStatus,
    severity: incident.severity,
  };
  const playbook = getInvestigationPlaybook(incident.category);

  return {
    ...incident,
    businessImpactReasoning:
      typeof incident.businessImpactReasoning === "string" && incident.businessImpactReasoning.trim()
        ? incident.businessImpactReasoning
        : generateBusinessImpactReasoning(incident, intelligenceContext),
    investigationPlaybook:
      Array.isArray(incident.investigationPlaybook) && incident.investigationPlaybook.length > 0
        ? incident.investigationPlaybook
        : playbook.steps,
    rcaHypotheses:
      Array.isArray(incident.rcaHypotheses) && incident.rcaHypotheses.length > 0
        ? incident.rcaHypotheses
        : playbook.rcaHypotheses,
    stakeholderUpdateDraft:
      typeof incident.stakeholderUpdateDraft === "string" && incident.stakeholderUpdateDraft.trim()
        ? incident.stakeholderUpdateDraft
        : generateStakeholderUpdateDraft(incident, intelligenceContext),
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
    setScreen("result");
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
          <h1>Incident Intelligence Platform</h1>
        </div>
        <nav className="app-nav" aria-label="Primary">
          {[
            ["dashboard", "Dashboard"],
            ["add", "Add Incident"],
            ["result", "Classification Result"],
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
        {screen === "add" ? <AddIncidentForm onSubmit={handleIncidentSubmit} /> : null}
        {screen === "result" ? (
          <ClassificationResult incident={latestIncident} onNavigate={navigate} />
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
