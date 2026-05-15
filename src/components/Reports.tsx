import { RiskBadge, SlaBadge } from "./Badges";
import { INCIDENT_CATEGORIES, INCIDENT_STATUSES, type Incident, type IncidentStatus } from "../types/incident";

interface ReportsProps {
  incidents: Incident[];
}

export function Reports({ incidents }: ReportsProps) {
  const averageRisk = incidents.length
    ? Math.round(incidents.reduce((total, incident) => total + incident.riskScore, 0) / incidents.length)
    : 0;
  const highestRisk = [...incidents].sort((a, b) => b.riskScore - a.riskScore)[0];
  const categoryCounts = INCIDENT_CATEGORIES.map((category) => ({
    category,
    count: incidents.filter((incident) => incident.category === category).length,
  })).filter((item) => item.count > 0);
  const statusCounts = INCIDENT_STATUSES.map((status) => ({
    status,
    count: incidents.filter((incident) => incident.status === status).length,
  }));

  return (
    <section className="screen">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Stakeholder reporting</p>
          <h2>Reports</h2>
        </div>
      </div>

      <div className="metric-grid">
        <article className="metric-card">
          <span>Total incidents</span>
          <strong>{incidents.length}</strong>
        </article>
        <article className="metric-card">
          <span>Average risk score</span>
          <strong>{averageRisk}/100</strong>
        </article>
        <article className="metric-card">
          <span>Escalation required</span>
          <strong>{incidents.filter((incident) => incident.slaStatus === "Escalation Required").length}</strong>
        </article>
        <article className="metric-card">
          <span>Closed or resolved</span>
          <strong>{incidents.filter((incident) => ["Closed", "Resolved"].includes(incident.status)).length}</strong>
        </article>
      </div>

      <div className="dashboard-grid">
        <article className="panel">
          <h3>Highest risk incident</h3>
          {highestRisk ? (
            <div className="report-callout">
              <strong>{highestRisk.reference}: {highestRisk.title}</strong>
              <p>{highestRisk.stakeholderSummary}</p>
              <div className="row-badges">
                <RiskBadge label={highestRisk.riskLabel} />
                <SlaBadge label={highestRisk.slaStatus} />
              </div>
            </div>
          ) : (
            <p>No incidents available.</p>
          )}
        </article>

        <article className="panel">
          <h3>Status distribution</h3>
          <div className="status-distribution">
            <div className="status-meter" aria-label="Incident status distribution">
              {statusCounts
                .filter((item) => item.count > 0)
                .map((item) => (
                  <span
                    className={`status-segment ${statusClassName(item.status)}`}
                    key={item.status}
                    style={{ flexGrow: item.count }}
                    title={`${item.status}: ${item.count}`}
                  />
                ))}
            </div>
            {statusCounts.map((item) => (
              <ReportBar key={item.status} label={item.status} count={item.count} total={incidents.length} />
            ))}
          </div>
        </article>

        <article className="panel span-panel">
          <h3>Category mix</h3>
          <div className="category-grid">
            {categoryCounts.map((item) => (
              <div className="category-pill" key={item.category}>
                <span>{item.category}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

const statusToneClass: Record<IncidentStatus, string> = {
  Open: "status-open",
  Investigating: "status-investigating",
  Escalated: "status-escalated",
  Monitoring: "status-monitoring",
  Resolved: "status-resolved",
  Closed: "status-closed",
};

function statusClassName(status: IncidentStatus) {
  return statusToneClass[status];
}

function ReportBar({ label, count, total }: { label: IncidentStatus; count: number; total: number }) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  const width = count > 0 ? Math.max(8, percentage) : 0;

  return (
    <div className="report-bar">
      <div className="report-bar-meta">
        <span>
          <i className={`status-dot ${statusClassName(label)}`} aria-hidden="true" />
          {label}
        </span>
        <strong>
          {count}
          <small>{percentage}%</small>
        </strong>
      </div>
      <span className="bar-track">
        <span className={`bar-fill ${statusClassName(label)}`} style={{ width: `${width}%` }} />
      </span>
    </div>
  );
}
