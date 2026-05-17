import { RiskBadge, SlaBadge, StatusBadge } from "./Badges";
import { buildDashboardMetrics } from "../logic/dashboardMetrics";
import { getRepeatedPatternInsights } from "../logic/incidentRules";
import type { Incident } from "../types/incident";

interface DashboardProps {
  incidents: Incident[];
  onNavigate: (screen: "workbench" | "tracker" | "reports") => void;
  notice?: string;
}

export function Dashboard({ incidents, onNavigate, notice }: DashboardProps) {
  const metrics = buildDashboardMetrics(incidents);
  const repeatedPattern = getRepeatedPatternInsights(incidents)[0];

  return (
    <section className="screen">
      {notice ? <div className="success-message">{notice}</div> : null}
      <div className="section-heading">
        <div>
          <p className="eyebrow">Executive risk dashboard</p>
          <h2>Dashboard</h2>
        </div>
        <button className="primary-action" onClick={() => onNavigate("workbench")} type="button">
          + Open workbench
        </button>
      </div>

      <div className="metric-grid">
        <article className="metric-card">
          <span>Total incidents</span>
          <strong>{metrics.totalIncidents}</strong>
        </article>
        <article className="metric-card">
          <span>Critical/high incidents</span>
          <strong>{metrics.criticalHighIncidents}</strong>
        </article>
        <article className="metric-card">
          <span>Open incidents</span>
          <strong>{metrics.openIncidents}</strong>
        </article>
        <article className="metric-card">
          <span>SLA risk</span>
          <strong>{metrics.slaRiskCount}</strong>
        </article>
        <article className="metric-card">
          <span>Reconciliation breaks</span>
          <strong>{metrics.reconciliationBreaks}</strong>
        </article>
        <article className="metric-card">
          <span>Estimated exposure</span>
          <strong>GBP {metrics.estimatedFinancialExposure.toLocaleString("en-GB")}</strong>
        </article>
        <article className="metric-card">
          <span>Affected customers</span>
          <strong>{metrics.affectedCustomerTotal.toLocaleString("en-GB")}</strong>
        </article>
        <article className="metric-card">
          <span>High-risk open</span>
          <strong>{metrics.highRiskOpenIncidents}</strong>
        </article>
      </div>

      <div className="dashboard-grid">
        <article className="panel span-panel governance-panel">
          <p>
            Built as a practical MVP to demonstrate fintech incident triage, payment operations awareness,
            reconciliation risk handling, and structured reporting for regulated environments.
          </p>
          <p>Demo system only. No real customer, transaction, or banking data is used.</p>
        </article>

        {repeatedPattern ? (
          <article className="panel span-panel pattern-panel">
            <p className="eyebrow">Repeated pattern insight</p>
            <h3>{repeatedPattern.category} pattern detected</h3>
            <p>
              {repeatedPattern.count} incidents share this category. {repeatedPattern.opportunity}
            </p>
            <p>{repeatedPattern.followUp}</p>
          </article>
        ) : null}

        <article className="panel">
          <div className="panel-heading">
            <h3>Recent high-risk incidents</h3>
            <button className="text-action" onClick={() => onNavigate("tracker")} type="button">
              View tracker
            </button>
          </div>
          <div className="incident-list">
            {metrics.recentHighRiskIncidents.length > 0 ? (
              metrics.recentHighRiskIncidents.map((incident) => (
                <div className="incident-row" key={incident.id}>
                  <div>
                    <strong>{incident.reference}</strong>
                    <span>{incident.title} - {incident.paymentType}</span>
                    <span>GBP {incident.estimatedFinancialImpact.toLocaleString("en-GB")} exposure - {incident.affectedCustomers} customers</span>
                  </div>
                  <div className="row-badges">
                    <RiskBadge label={incident.riskLabel} />
                    <StatusBadge label={incident.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="muted-copy">No high-risk incidents are currently visible.</p>
            )}
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <h3>SLA watchlist</h3>
            <button className="text-action" onClick={() => onNavigate("reports")} type="button">
              Open reports
            </button>
          </div>
          <div className="incident-list">
            {incidents.filter((incident) => incident.slaStatus !== "On Track").length > 0 ? (
              incidents
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
                ))
            ) : (
              <p className="muted-copy">No incidents currently need SLA attention.</p>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
