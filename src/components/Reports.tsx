import { RiskBadge, SlaBadge } from "./Badges";
import { INCIDENT_CATEGORIES, INCIDENT_STATUSES, type Incident } from "../types/incident";

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
          <div className="bar-list">
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

function ReportBar({ label, count, total }: { label: string; count: number; total: number }) {
  const width = total > 0 ? Math.max(6, Math.round((count / total) * 100)) : 0;

  return (
    <div className="report-bar">
      <div>
        <span>{label}</span>
        <strong>{count}</strong>
      </div>
      <span className="bar-track">
        <span className="bar-fill" style={{ width: `${width}%` }} />
      </span>
    </div>
  );
}
