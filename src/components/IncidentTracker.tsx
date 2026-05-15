import { useState } from "react";
import { RiskBadge, SeverityBadge, SlaBadge, StatusBadge } from "./Badges";
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
    if (!selectedIncident) return;
    onUpdateStatus(selectedIncident.id, status);
    setNotice(`${selectedIncident.reference} status updated to ${status}. Dashboard metrics have refreshed.`);
  }

  return (
    <section className="screen">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Live tracker</p>
          <h2>Incident Tracker</h2>
        </div>
      </div>
      {notice ? <div className="success-message">{notice}</div> : null}

      <div className="tracker-layout">
        <article className="panel tracker-table">
          <table>
            <thead>
              <tr>
                <th>Ref</th>
                <th>Incident</th>
                <th>Category</th>
                <th>Risk</th>
                <th>SLA</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr
                  className={selectedIncident?.id === incident.id ? "selected-row" : ""}
                  key={incident.id}
                  onClick={() => onSelectIncident(incident.id)}
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") onSelectIncident(incident.id);
                  }}
                >
                  <td>{incident.reference}</td>
                  <td>
                    <strong>{incident.title}</strong>
                    <span>{incident.affectedService}</span>
                  </td>
                  <td>{incident.category}</td>
                  <td>
                    <RiskBadge label={incident.riskLabel} />
                  </td>
                  <td>
                    <SlaBadge label={incident.slaStatus} />
                  </td>
                  <td>
                    <StatusBadge label={incident.status} />
                  </td>
                </tr>
              ))}
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
      </dl>

      <label className="status-control">
        Update status
        <select value={incident.status} onChange={(event) => onUpdateStatus(event.target.value as IncidentStatus)}>
          {INCIDENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <article className="summary-panel compact">
        <h4>Stakeholder summary</h4>
        <p>{incident.stakeholderSummary}</p>
      </article>
    </aside>
  );
}
