import { useEffect, useMemo, useState } from "react";
import { AddIncidentForm } from "./components/AddIncidentForm";
import { ClassificationResult } from "./components/ClassificationResult";
import { Dashboard } from "./components/Dashboard";
import { IncidentTracker } from "./components/IncidentTracker";
import { Reports } from "./components/Reports";
import { createIncident } from "./logic/incidentRules";
import { demoIncidents } from "./data/demoIncidents";
import type { Incident, IncidentDraft, IncidentStatus } from "./types/incident";

type Screen = "dashboard" | "add" | "result" | "tracker" | "reports";

const storageKey = "fintech-incident-intelligence-incidents";

function loadIncidents(): Incident[] {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return demoIncidents;
    const parsed = JSON.parse(stored) as Incident[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : demoIncidents;
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

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(incidents));
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
