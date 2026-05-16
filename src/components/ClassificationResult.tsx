import { RiskBadge, SeverityBadge, SlaBadge, StatusBadge } from "./Badges";
import type { Incident } from "../types/incident";

interface ClassificationResultProps {
  incident: Incident | null;
  onNavigate: (screen: "workbench" | "tracker" | "dashboard") => void;
}

export function ClassificationResult({ incident, onNavigate }: ClassificationResultProps) {
  if (!incident) {
    return (
      <section className="screen">
        <div className="empty-state">
          <h2>Incident Classification Engine</h2>
          <p>No incident has been classified in this session yet.</p>
          <button className="primary-action" onClick={() => onNavigate("workbench")} type="button">
            Open workbench
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
        <button className="secondary-action" onClick={() => onNavigate("tracker")} type="button">
          Open in tracker
        </button>
      </div>

      <div className="result-grid">
        <article className="result-card">
          <span>Category</span>
          <strong>{incident.category}</strong>
        </article>
        <article className="result-card">
          <span>Payment type</span>
          <strong>{incident.paymentType}</strong>
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

      <div className="result-grid result-grid-operations">
        <article className="result-card">
          <span>Affected customers</span>
          <strong>{incident.affectedCustomers}</strong>
        </article>
        <article className="result-card">
          <span>Transactions</span>
          <strong>{incident.transactionCount}</strong>
        </article>
        <article className="result-card">
          <span>Estimated exposure</span>
          <strong>GBP {incident.estimatedFinancialImpact.toLocaleString("en-GB")}</strong>
        </article>
        <article className="result-card">
          <span>Owner/team</span>
          <strong>{incident.ownerTeam}</strong>
        </article>
      </div>

      <article className="summary-panel">
        <h3>Classification engine output</h3>
        <p>{incident.stakeholderSummary}</p>
      </article>

      <div className="intelligence-grid">
        <article className="summary-panel">
          <h3>Recommended action</h3>
          <p>{incident.recommendedAction}</p>
        </article>

        <article className="summary-panel">
          <h3>Escalation requirement</h3>
          <p>{incident.escalationRequirement}</p>
        </article>

        <article className="summary-panel">
          <h3>Reconciliation priority</h3>
          <p>{incident.reconciliationPriority}</p>
        </article>

        <article className="summary-panel">
          <h3>Reporting note</h3>
          <p>{incident.reportingNote}</p>
        </article>

        <article className="summary-panel">
          <h3>Business impact reasoning</h3>
          <p>{incident.businessImpactReasoning}</p>
        </article>

        <article className="summary-panel">
          <h3>Stakeholder update draft</h3>
          <p>{incident.stakeholderUpdateDraft}</p>
        </article>

        <article className="summary-panel">
          <h3>Investigation playbook</h3>
          <ul className="insight-list">
            {incident.investigationPlaybook.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </article>

        <article className="summary-panel">
          <h3>Possible causes to investigate</h3>
          <ul className="insight-list">
            {incident.rcaHypotheses.map((hypothesis) => (
              <li key={hypothesis}>{hypothesis}</li>
            ))}
          </ul>
        </article>
      </div>

      <div className="action-row">
        <button className="secondary-action" onClick={() => onNavigate("workbench")} type="button">
          Continue in workbench
        </button>
        <button className="primary-action" onClick={() => onNavigate("dashboard")} type="button">
          Return to dashboard
        </button>
      </div>
    </section>
  );
}
