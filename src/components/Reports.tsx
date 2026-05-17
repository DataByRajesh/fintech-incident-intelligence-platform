import { RiskBadge, SeverityBadge, SlaBadge } from "./Badges";
import {
  buildManagementReport,
  createReportTextDownloadHref,
  getSeverityClassName,
  getSeverityPercentage,
} from "../logic/reportBuilder";
import type { Incident, Severity } from "../types/incident";

interface ReportsProps {
  incidents: Incident[];
}

export function Reports({ incidents }: ReportsProps) {
  const report = buildManagementReport(incidents);
  const exportHref = createReportTextDownloadHref(incidents);

  return (
    <section className="screen">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Structured management reports</p>
          <h2>Reports</h2>
        </div>
        <a className="secondary-action" download="incident-management-report.txt" href={exportHref}>
          Download report
        </a>
      </div>

      <div className="metric-grid">
        <article className="metric-card">
          <span>Total incidents</span>
          <strong>{report.totalIncidents}</strong>
        </article>
        <article className="metric-card">
          <span>Financial exposure</span>
          <strong>GBP {report.totalExposure.toLocaleString("en-GB")}</strong>
        </article>
        <article className="metric-card">
          <span>Affected customers</span>
          <strong>{report.affectedCustomers.toLocaleString("en-GB")}</strong>
        </article>
        <article className="metric-card">
          <span>Escalation required</span>
          <strong>{report.escalationItems.length}</strong>
        </article>
      </div>

      <div className="dashboard-grid">
        <article className="panel">
          <h3>Operational summary</h3>
          <p className="muted-copy">{report.operationalSummary}</p>
        </article>

        <article className="panel">
          <h3>Severity breakdown</h3>
          <div className="status-distribution">
            {report.severityBreakdown.map((item) => (
              <ReportBar
                count={item.count}
                key={item.severity}
                label={item.severity}
                total={report.totalIncidents}
              />
            ))}
          </div>
        </article>

        <article className="panel span-panel">
          <h3>Reconciliation summary</h3>
          {report.reconciliationIncidents.length > 0 ? (
            <div className="pattern-list">
              {report.reconciliationIncidents.slice(0, 5).map((incident) => (
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

        <article className="panel span-panel">
          <h3>SLA/escalation summary</h3>
          <p className="muted-copy">{report.slaEscalationSummary}</p>
        </article>

        <article className="panel">
          <h3>Customer impact summary</h3>
          <p className="muted-copy">{report.customerImpactSummary}</p>
        </article>

        <article className="panel">
          <h3>Financial exposure</h3>
          {report.highestRisk ? (
            <div className="report-callout">
              <strong>{report.highestRisk.reference}: {report.highestRisk.title}</strong>
              <p>{report.highestRisk.reportingNote}</p>
              <div className="row-badges">
                <RiskBadge label={report.highestRisk.riskLabel} />
                <SlaBadge label={report.highestRisk.slaStatus} />
              </div>
            </div>
          ) : (
            <p className="muted-copy">No exposure data is available.</p>
          )}
        </article>

        <article className="panel span-panel">
          <h3>Management update</h3>
          <p className="muted-copy">{report.managementUpdate}</p>
        </article>

        <article className="panel span-panel">
          <h3>Next steps</h3>
          <div className="pattern-list">
            {report.repeatedPatterns.length > 0 ? (
              report.repeatedPatterns.map((pattern) => (
                <div className="pattern-item" key={pattern.category}>
                  <strong>{pattern.category}</strong>
                  <p>{pattern.opportunity}</p>
                  <p>{pattern.followUp}</p>
                </div>
              ))
            ) : (
              <p className="muted-copy">{report.nextSteps[0]}</p>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

function ReportBar({ label, count, total }: { label: Severity; count: number; total: number }) {
  const percentage = getSeverityPercentage(count, total);
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
        <span className={`bar-fill ${getSeverityClassName(label)}`} style={{ width: `${width}%` }} />
      </span>
      <SeverityBadge label={label} />
    </div>
  );
}
