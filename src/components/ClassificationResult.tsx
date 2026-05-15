import { RiskBadge, SeverityBadge, SlaBadge, StatusBadge } from "./Badges";
import type { Incident } from "../types/incident";

interface ClassificationResultProps {
  incident: Incident | null;
  onNavigate: (screen: "add" | "tracker" | "dashboard") => void;
}

export function ClassificationResult({ incident, onNavigate }: ClassificationResultProps) {
  if (!incident) {
    return (
      <section className="screen">
        <div className="empty-state">
          <h2>Classification Result</h2>
          <p>No incident has been classified in this session yet.</p>
          <button className="primary-action" onClick={() => onNavigate("add")}>
            Log incident
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="screen">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Classification complete</p>
          <h2>{incident.reference}: {incident.title}</h2>
        </div>
        <button className="secondary-action" onClick={() => onNavigate("tracker")}>
          Open in tracker
        </button>
      </div>

      <div className="result-grid">
        <article className="result-card">
          <span>Category</span>
          <strong>{incident.category}</strong>
        </article>
        <article className="result-card">
          <span>Severity</span>
          <SeverityBadge label={incident.severity} />
        </article>
        <article className="result-card">
          <span>Risk score</span>
          <strong>{incident.riskScore}/100</strong>
          <RiskBadge label={incident.riskLabel} />
        </article>
        <article className="result-card">
          <span>SLA status</span>
          <SlaBadge label={incident.slaStatus} />
        </article>
        <article className="result-card">
          <span>Workflow status</span>
          <StatusBadge label={incident.status} />
        </article>
      </div>

      <article className="summary-panel">
        <h3>Stakeholder summary</h3>
        <p>{incident.stakeholderSummary}</p>
      </article>

      <div className="action-row">
        <button className="secondary-action" onClick={() => onNavigate("add")}>
          Add another incident
        </button>
        <button className="primary-action" onClick={() => onNavigate("dashboard")}>
          Return to dashboard
        </button>
      </div>
    </section>
  );
}
