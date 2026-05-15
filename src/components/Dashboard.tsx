import { RiskBadge, SlaBadge, StatusBadge } from "./Badges";
import type { Incident } from "../types/incident";

interface DashboardProps {
  incidents: Incident[];
  onNavigate: (screen: "add" | "tracker" | "reports") => void;
  notice?: string;
}

export function Dashboard({ incidents, onNavigate, notice }: DashboardProps) {
  const openIncidents = incidents.filter((incident) => !["Resolved", "Closed"].includes(incident.status));
  const criticalRisks = incidents.filter((incident) => incident.riskLabel === "Critical").length;
  const breachedOrEscalated = incidents.filter((incident) =>
    ["Breached", "Escalation Required"].includes(incident.slaStatus),
  ).length;
  const resolved = incidents.filter((incident) => ["Resolved", "Closed"].includes(incident.status)).length;
  const latest = [...incidents]
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 4);

  return (
    <section className="screen">
      {notice ? <div className="success-message">{notice}</div> : null}
      <div className="section-heading">
        <div>
          <p className="eyebrow">Operational command view</p>
          <h2>Dashboard</h2>
        </div>
        <button className="primary-action" onClick={() => onNavigate("add")}>
          + Log incident
        </button>
      </div>

      <div className="metric-grid">
        <article className="metric-card">
          <span>Active incidents</span>
          <strong>{openIncidents.length}</strong>
        </article>
        <article className="metric-card">
          <span>Critical risk</span>
          <strong>{criticalRisks}</strong>
        </article>
        <article className="metric-card">
          <span>SLA pressure</span>
          <strong>{breachedOrEscalated}</strong>
        </article>
        <article className="metric-card">
          <span>Resolved/closed</span>
          <strong>{resolved}</strong>
        </article>
      </div>

      <div className="dashboard-grid">
        <article className="panel">
          <div className="panel-heading">
            <h3>Latest incident movement</h3>
            <button className="text-action" onClick={() => onNavigate("tracker")}>
              View tracker
            </button>
          </div>
          <div className="incident-list">
            {latest.map((incident) => (
              <div className="incident-row" key={incident.id}>
                <div>
                  <strong>{incident.reference}</strong>
                  <span>{incident.title}</span>
                </div>
                <div className="row-badges">
                  <RiskBadge label={incident.riskLabel} />
                  <StatusBadge label={incident.status} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <h3>SLA watchlist</h3>
            <button className="text-action" onClick={() => onNavigate("reports")}>
              Open reports
            </button>
          </div>
          <div className="incident-list">
            {incidents
              .filter((incident) => incident.slaStatus !== "On Track")
              .slice(0, 4)
              .map((incident) => (
                <div className="incident-row" key={incident.id}>
                  <div>
                    <strong>{incident.category}</strong>
                    <span>{incident.affectedService}</span>
                  </div>
                  <SlaBadge label={incident.slaStatus} />
                </div>
              ))}
          </div>
        </article>
      </div>
    </section>
  );
}
