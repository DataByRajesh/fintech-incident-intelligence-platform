import { useState } from "react";
import { RiskBadge, SeverityBadge, SlaBadge, StatusBadge } from "./Badges";
import { isReconciliationRisk } from "../logic/incidentRules";
import { INCIDENT_STATUSES, type Incident, type IncidentStatus } from "../types/incident";

interface IncidentTrackerProps {
  incidents: Incident[];
  selectedIncidentId: string | null;
  onSelectIncident: (id: string) => void;
  onUpdateStatus: (id: string, status: IncidentStatus) => void;
}

export function IncidentTracker({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  onUpdateStatus,
}: IncidentTrackerProps) {
  const [notice, setNotice] = useState("");
  const selectedIncident = incidents.find((incident) => incident.id === selectedIncidentId) ?? incidents[0] ?? null;

  function handleStatusChange(status: IncidentStatus) {
    if (!selectedIncident) {
      setNotice("Select an incident before updating status.");
      return;
    }

    if (selectedIncident.status === status) {
      setNotice(`${selectedIncident.reference} is already marked ${status}.`);
      return;
    }

    onUpdateStatus(selectedIncident.id, status);
    setNotice(`${selectedIncident.reference} status updated to ${status}. Dashboard metrics have refreshed.`);
  }

  return (
    <section className="screen">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Operational risk tracker</p>
          <h2>Incident Tracker</h2>
        </div>
      </div>
      {notice ? <div className="success-message">{notice}</div> : null}

      <div className="dashboard-grid tracker-summary-grid">
        <RiskView
          title="Reconciliation Risk View"
          incidents={incidents.filter(isReconciliationRisk)}
          emptyCopy="No reconciliation-sensitive incidents are currently open for review."
        />
        <RiskView
          title="SLA & Escalation View"
          incidents={incidents.filter((incident) => incident.slaStatus !== "On Track" || incident.status === "Escalated")}
          emptyCopy="No incidents currently require SLA or escalation attention."
        />
      </div>

      <div className="tracker-layout">
        <article className="panel tracker-table">
          <table>
            <thead>
              <tr>
                <th>Ref</th>
                <th>Incident</th>
                <th>Payment type</th>
                <th>Category</th>
                <th>Severity</th>
                <th>SLA</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Impact</th>
              </tr>
            </thead>
            <tbody>
              {incidents.length > 0 ? (
                incidents.map((incident) => (
                  <tr
                    className={selectedIncident?.id === incident.id ? "selected-row" : ""}
                    key={incident.id}
                    onClick={() => onSelectIncident(incident.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelectIncident(incident.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <td>{incident.reference}</td>
                    <td>
                      <strong>{incident.title}</strong>
                      <span>{incident.recommendedAction}</span>
                    </td>
                    <td>{incident.paymentType}</td>
                    <td>{incident.category}</td>
                    <td>
                      <SeverityBadge label={incident.severity} />
                    </td>
                    <td>
                      <SlaBadge label={incident.slaStatus} />
                    </td>
                    <td>
                      <StatusBadge label={incident.status} />
                    </td>
                    <td>{incident.ownerTeam}</td>
                    <td>GBP {incident.estimatedFinancialImpact.toLocaleString("en-GB")}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9}>
                    <p className="muted-copy table-empty">No incidents are available in the tracker.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </article>

        <IncidentDetails incident={selectedIncident} onUpdateStatus={handleStatusChange} />
      </div>
    </section>
  );
}

function IncidentDetails({
  incident,
  onUpdateStatus,
}: {
  incident: Incident | null;
  onUpdateStatus: (status: IncidentStatus) => void;
}) {
  if (!incident) {
    return (
      <aside className="details-panel">
        <h3>No incidents available</h3>
        <p>Add an incident to open details and update status.</p>
      </aside>
    );
  }

  return (
    <aside className="details-panel">
      <div className="details-heading">
        <span>{incident.reference}</span>
        <StatusBadge label={incident.status} />
      </div>
      <h3>{incident.title}</h3>
      <p>{incident.description}</p>

      <dl className="details-list">
        <div>
          <dt>Category</dt>
          <dd>{incident.category}</dd>
        </div>
        <div>
          <dt>Payment type</dt>
          <dd>{incident.paymentType}</dd>
        </div>
        <div>
          <dt>Severity</dt>
          <dd><SeverityBadge label={incident.severity} /></dd>
        </div>
        <div>
          <dt>Risk score</dt>
          <dd>{incident.riskScore}/100</dd>
        </div>
        <div>
          <dt>SLA status</dt>
          <dd><SlaBadge label={incident.slaStatus} /></dd>
        </div>
        <div>
          <dt>Reported by</dt>
          <dd>{incident.reportedBy}</dd>
        </div>
        <div>
          <dt>Owner/team</dt>
          <dd>{incident.ownerTeam}</dd>
        </div>
        <div>
          <dt>Impact</dt>
          <dd>GBP {incident.estimatedFinancialImpact.toLocaleString("en-GB")}</dd>
        </div>
        <div>
          <dt>Customers</dt>
          <dd>{incident.affectedCustomers}</dd>
        </div>
      </dl>

      <label className="status-control">
        Update status
        <select
          aria-label={`Update status for ${incident.reference}`}
          value={incident.status}
          onChange={(event) => onUpdateStatus(event.target.value as IncidentStatus)}
        >
          {INCIDENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <article className="summary-panel compact">
        <h4>Recommended next action</h4>
        <p>{incident.recommendedAction}</p>
      </article>

      <article className="summary-panel compact">
        <h4>Escalation and reconciliation</h4>
        <p>{incident.escalationRequirement} {incident.reconciliationPriority}.</p>
      </article>

      <article className="summary-panel compact">
        <h4>Business impact reasoning</h4>
        <p>{incident.businessImpactReasoning}</p>
      </article>

      <article className="summary-panel compact">
        <h4>Investigation playbook</h4>
        <ul className="insight-list compact-list">
          {incident.investigationPlaybook.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </article>

      <article className="summary-panel compact">
        <h4>Possible causes to investigate</h4>
        <ul className="insight-list compact-list">
          {incident.rcaHypotheses.map((hypothesis) => (
            <li key={hypothesis}>{hypothesis}</li>
          ))}
        </ul>
      </article>

      <article className="summary-panel compact">
        <h4>Stakeholder update draft</h4>
        <p>{incident.stakeholderUpdateDraft}</p>
      </article>
    </aside>
  );
}

function RiskView({ title, incidents, emptyCopy }: { title: string; incidents: Incident[]; emptyCopy: string }) {
  const topIncidents = [...incidents].sort((a, b) => b.riskScore - a.riskScore).slice(0, 3);

  return (
    <article className="panel">
      <h3>{title}</h3>
      <div className="incident-list">
        {topIncidents.length > 0 ? (
          topIncidents.map((incident) => (
            <div className="incident-row" key={incident.id}>
              <div>
                <strong>{incident.reference}: {incident.paymentType}</strong>
                <span>{incident.category} - {incident.ownerTeam}</span>
                <span>{incident.recommendedAction}</span>
              </div>
              <div className="row-badges">
                <RiskBadge label={incident.riskLabel} />
                <SlaBadge label={incident.slaStatus} />
              </div>
            </div>
          ))
        ) : (
          <p className="muted-copy">{emptyCopy}</p>
        )}
      </div>
    </article>
  );
}
