import { RiskBadge, SeverityBadge, SlaBadge } from "./Badges";
import { getRepeatedPatternInsights, isReconciliationRisk } from "../logic/incidentRules";
import { SEVERITIES, type Incident, type Severity } from "../types/incident";

interface ReportsProps {
  incidents: Incident[];
}

export function Reports({ incidents }: ReportsProps) {
  const totalExposure = incidents.reduce((total, incident) => total + incident.estimatedFinancialImpact, 0);
  const affectedCustomers = incidents.reduce((total, incident) => total + incident.affectedCustomers, 0);
  const reconciliationIncidents = incidents.filter(isReconciliationRisk);
  const highRiskOpen = incidents.filter(
    (incident) => !["Resolved", "Closed"].includes(incident.status) && ["Critical", "High"].includes(incident.riskLabel),
  );
  const escalationItems = incidents.filter((incident) => incident.slaStatus === "Escalation Required");
  const repeatedPatterns = getRepeatedPatternInsights(incidents);
  const highestRisk = [...incidents].sort((a, b) => b.riskScore - a.riskScore)[0];

  return (
    <section className="screen">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Structured management reports</p>
          <h2>Reports</h2>
        </div>
      </div>

      <div className="metric-grid">
        <article className="metric-card">
          <span>Total incidents</span>
          <strong>{incidents.length}</strong>
        </article>
        <article className="metric-card">
          <span>Financial exposure</span>
          <strong>GBP {totalExposure.toLocaleString("en-GB")}</strong>
        </article>
        <article className="metric-card">
          <span>Affected customers</span>
          <strong>{affectedCustomers.toLocaleString("en-GB")}</strong>
        </article>
        <article className="metric-card">
          <span>Escalation required</span>
          <strong>{escalationItems.length}</strong>
        </article>
      </div>

      <div className="dashboard-grid">
        <article className="panel">
          <h3>Operational summary</h3>
          <p className="muted-copy">
            {incidents.length} demo incidents are under review, with {highRiskOpen.length} open high-risk items and
            {reconciliationIncidents.length} reconciliation-sensitive cases. The current estimated exposure is GBP{" "}
            {totalExposure.toLocaleString("en-GB")}.
          </p>
        </article>

        <article className="panel">
          <h3>Severity breakdown</h3>
          <div className="status-distribution">
            {SEVERITIES.map((severity) => (
              <ReportBar
                count={incidents.filter((incident) => incident.severity === severity).length}
                key={severity}
                label={severity}
                total={incidents.length}
              />
            ))}
          </div>
        </article>

        <article className="panel span-panel">
          <h3>Reconciliation summary</h3>
          {reconciliationIncidents.length > 0 ? (
            <div className="pattern-list">
              {reconciliationIncidents.slice(0, 5).map((incident) => (
                <div className="pattern-item" key={incident.id}>
                  <strong>{incident.reference}: {incident.category}</strong>
                  <p>{incident.reportingNote}</p>
                  <p>{incident.reconciliationPriority}. {incident.recommendedAction}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted-copy">No reconciliation-sensitive incidents are currently present.</p>
          )}
        </article>

        <article className="panel">
          <h3>Customer impact summary</h3>
          <p className="muted-copy">
            Total affected customers: {affectedCustomers.toLocaleString("en-GB")}. Highest customer exposure:{" "}
            {Math.max(0, ...incidents.map((incident) => incident.affectedCustomers)).toLocaleString("en-GB")} customers
            on a single incident.
          </p>
        </article>

        <article className="panel">
          <h3>Financial exposure</h3>
          {highestRisk ? (
            <div className="report-callout">
              <strong>{highestRisk.reference}: {highestRisk.title}</strong>
              <p>{highestRisk.reportingNote}</p>
              <div className="row-badges">
                <RiskBadge label={highestRisk.riskLabel} />
                <SlaBadge label={highestRisk.slaStatus} />
              </div>
            </div>
          ) : (
            <p className="muted-copy">No exposure data is available.</p>
          )}
        </article>

        <article className="panel span-panel">
          <h3>Management update</h3>
          <p className="muted-copy">
            Current risk operations focus is on high-severity payment incidents, reconciliation breaks, SLA pressure,
            and customer-impacting payment exceptions. Demo outputs are structured for management communication and
            interview walkthroughs, not operational use with real banking data.
          </p>
        </article>

        <article className="panel span-panel">
          <h3>Next steps</h3>
          <div className="pattern-list">
            {repeatedPatterns.length > 0 ? (
              repeatedPatterns.map((pattern) => (
                <div className="pattern-item" key={pattern.category}>
                  <strong>{pattern.category}</strong>
                  <p>{pattern.opportunity}</p>
                  <p>{pattern.followUp}</p>
                </div>
              ))
            ) : (
              <p className="muted-copy">
                Continue monitoring demo incidents, confirm ownership, and validate reconciliation evidence before closure.
              </p>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

function ReportBar({ label, count, total }: { label: Severity; count: number; total: number }) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  const width = count > 0 ? Math.max(8, percentage) : 0;

  return (
    <div className="report-bar">
      <div className="report-bar-meta">
        <span>{label}</span>
        <strong>
          {count}
          <small>{percentage}%</small>
        </strong>
      </div>
      <span className="bar-track">
        <span className={`bar-fill ${severityClassName(label)}`} style={{ width: `${width}%` }} />
      </span>
      <SeverityBadge label={label} />
    </div>
  );
}

function severityClassName(severity: Severity) {
  return `severity-${severity.toLowerCase()}`;
}
