import { useMemo, useState } from "react";
import { RiskBadge, SeverityBadge, SlaBadge, StatusBadge } from "./Badges";
import { isReconciliationRisk } from "../logic/incidentRules";
import { buildPriorityMatrix } from "../logic/priorityMatrix";
import { getSlaAgeing } from "../logic/slaAgeing";
import {
  INCIDENT_STATUSES,
  SEVERITIES,
  type Incident,
  type IncidentStatus,
  type PaymentType,
  type Severity,
  type SlaStatus,
} from "../types/incident";

interface IncidentTrackerProps {
  incidents: Incident[];
  selectedIncidentId: string | null;
  onSelectIncident: (id: string) => void;
  onUpdateStatus: (id: string, status: IncidentStatus) => void;
  onUpdateOwner: (id: string, ownerTeam: string) => void;
}

type TrackerSort = "Severity" | "SLA risk";

const paymentTypes: PaymentType[] = ["Faster Payments", "BACS", "CHAPS", "Card", "Open Banking", "SWIFT", "SEPA"];

const severityRank: Record<Severity, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

const slaRank: Record<SlaStatus, number> = {
  "Escalation Required": 4,
  Breached: 3,
  "At Risk": 2,
  "On Track": 1,
};

export function IncidentTracker({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  onUpdateStatus,
  onUpdateOwner,
}: IncidentTrackerProps) {
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | "All">("All");
  const [severityFilter, setSeverityFilter] = useState<Severity | "All">("All");
  const [paymentFilter, setPaymentFilter] = useState<PaymentType | "All">("All");
  const [sortMode, setSortMode] = useState<TrackerSort>("Severity");
  const filteredIncidents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return incidents
      .filter((incident) => {
        const matchesQuery =
          normalizedQuery.length === 0 ||
          [incident.title, incident.category, incident.ownerTeam, incident.paymentType]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);
        const matchesStatus = statusFilter === "All" || incident.status === statusFilter;
        const matchesSeverity = severityFilter === "All" || incident.severity === severityFilter;
        const matchesPayment = paymentFilter === "All" || incident.paymentType === paymentFilter;

        return matchesQuery && matchesStatus && matchesSeverity && matchesPayment;
      })
      .sort((a, b) => {
        if (sortMode === "SLA risk") return slaRank[b.slaStatus] - slaRank[a.slaStatus] || b.riskScore - a.riskScore;
        return severityRank[b.severity] - severityRank[a.severity] || b.riskScore - a.riskScore;
      });
  }, [incidents, paymentFilter, query, severityFilter, sortMode, statusFilter]);
  const selectedIncident =
    incidents.find((incident) => incident.id === selectedIncidentId) ?? filteredIncidents[0] ?? incidents[0] ?? null;
  const reconciliationIncidents = incidents.filter(isReconciliationRisk);
  const slaEscalationIncidents = incidents.filter(
    (incident) =>
      incident.slaStatus !== "On Track" ||
      incident.status === "Escalated" ||
      incident.escalationRequirement.toLowerCase().includes("escalation"),
  );
  const ownerTeams = useMemo(
    () => Array.from(new Set(incidents.map((incident) => incident.ownerTeam).filter(Boolean))).sort(),
    [incidents],
  );
  const priorityMatrix = useMemo(() => buildPriorityMatrix(incidents), [incidents]);

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

      <div className="control-panel" aria-label="Incident tracker filters">
        <label>
          Search incidents
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Title, category, owner, payment type"
          />
        </label>
        <label>
          Severity
          <select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value as Severity | "All")}>
            <option value="All">All severities</option>
            {SEVERITIES.map((severity) => (
              <option key={severity} value={severity}>
                {severity}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as IncidentStatus | "All")}>
            <option value="All">All statuses</option>
            {INCIDENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label>
          Payment type
          <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value as PaymentType | "All")}>
            <option value="All">All payment types</option>
            {paymentTypes.map((paymentType) => (
              <option key={paymentType} value={paymentType}>
                {paymentType}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sort by
          <select value={sortMode} onChange={(event) => setSortMode(event.target.value as TrackerSort)}>
            <option value="Severity">Severity</option>
            <option value="SLA risk">SLA risk</option>
          </select>
        </label>
        <div className="control-summary">
          <strong>{filteredIncidents.length}</strong>
          <span>of {incidents.length} incidents shown</span>
        </div>
      </div>

      <div className="dashboard-grid tracker-summary-grid">
        <RiskView
          title="Reconciliation Risk View"
          incidents={reconciliationIncidents}
          mode="reconciliation"
          emptyCopy="No reconciliation-sensitive incidents are currently open for review."
        />
        <RiskView
          title="SLA & Escalation View"
          incidents={slaEscalationIncidents}
          mode="sla"
          emptyCopy="No incidents currently require SLA or escalation attention."
        />
      </div>

      <PriorityHeatmap cells={priorityMatrix} />

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
                <th>Risk</th>
                <th>SLA</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Reconciliation</th>
                <th>Customers</th>
                <th>Impact</th>
                <th>Recommended next action</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.length > 0 ? (
                filteredIncidents.map((incident) => (
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
                      <span>{incident.affectedService}</span>
                    </td>
                    <td>{incident.paymentType}</td>
                    <td>{incident.category}</td>
                    <td>
                      <SeverityBadge label={incident.severity} />
                    </td>
                    <td>
                      <RiskBadge label={incident.riskLabel} />
                    </td>
                    <td>
                      <SlaAgeingIndicator incident={incident} compact />
                    </td>
                    <td>
                      <StatusBadge label={incident.status} />
                    </td>
                    <td>{incident.ownerTeam}</td>
                    <td>{incident.reconciliationPriority}</td>
                    <td>{incident.affectedCustomers.toLocaleString("en-GB")}</td>
                    <td>GBP {incident.estimatedFinancialImpact.toLocaleString("en-GB")}</td>
                    <td>{incident.recommendedAction}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={13}>
                    <p className="muted-copy table-empty">No incidents match the current tracker filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </article>

        <IncidentDetails
          incident={selectedIncident}
          ownerTeams={ownerTeams}
          onUpdateOwner={onUpdateOwner}
          onUpdateStatus={handleStatusChange}
        />
      </div>
    </section>
  );
}

function IncidentDetails({
  incident,
  ownerTeams,
  onUpdateOwner,
  onUpdateStatus,
}: {
  incident: Incident | null;
  ownerTeams: string[];
  onUpdateOwner: (id: string, ownerTeam: string) => void;
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
      <p>{incident.stakeholderSummary}</p>

      <dl className="details-list">
        <div>
          <dt>Incident summary</dt>
          <dd>{incident.description}</dd>
        </div>
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
          <dt>Risk level</dt>
          <dd><RiskBadge label={incident.riskLabel} /></dd>
        </div>
        <div>
          <dt>Current status</dt>
          <dd><StatusBadge label={incident.status} /></dd>
        </div>
        <div>
          <dt>SLA risk</dt>
          <dd><SlaAgeingIndicator incident={incident} /></dd>
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
        <div>
          <dt>Transactions</dt>
          <dd>{incident.transactionCount.toLocaleString("en-GB")}</dd>
        </div>
        <div>
          <dt>Customer/regulatory impact</dt>
          <dd>{incident.customerImpact} customer / {incident.complianceSensitivity} regulatory</dd>
        </div>
        <div>
          <dt>Reconciliation priority</dt>
          <dd>{incident.reconciliationPriority}</dd>
        </div>
        <div>
          <dt>Escalation requirement</dt>
          <dd>{incident.escalationRequirement}</dd>
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

      <label className="status-control">
        Assign owner/team
        <select
          aria-label={`Assign owner/team for ${incident.reference}`}
          value={incident.ownerTeam}
          onChange={(event) => onUpdateOwner(incident.id, event.target.value)}
        >
          {ownerTeams.map((ownerTeam) => (
            <option key={ownerTeam} value={ownerTeam}>
              {ownerTeam}
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
        <h4>Reporting note</h4>
        <p>{incident.reportingNote}</p>
      </article>

      <article className="summary-panel compact">
        <h4>Notes</h4>
        <p>{incident.notes || "No additional notes captured."}</p>
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

      <article className="summary-panel compact">
        <h4>Activity timeline</h4>
        <div className="audit-list">
          {incident.auditTrail.slice(0, 5).map((entry) => (
            <div className="audit-item" key={`${entry.timestamp}-${entry.action}-${entry.status}`}>
              <strong>{entry.action}: {entry.status}</strong>
              <span>{new Date(entry.timestamp).toLocaleString("en-GB")} - {entry.actor}</span>
              <p>{entry.note}</p>
            </div>
          ))}
        </div>
      </article>
    </aside>
  );
}

function SlaAgeingIndicator({ incident, compact = false }: { incident: Incident; compact?: boolean }) {
  const ageing = getSlaAgeing(incident);

  return (
    <div className={compact ? "sla-ageing compact-ageing" : "sla-ageing"}>
      <SlaBadge label={incident.slaStatus} />
      <span>{ageing.ageLabel}</span>
      <small>{ageing.countdownLabel}</small>
    </div>
  );
}

function PriorityHeatmap({ cells }: { cells: ReturnType<typeof buildPriorityMatrix> }) {
  return (
    <article className="panel span-panel priority-heatmap" aria-label="Risk heatmap">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Priority matrix</p>
          <h3>Risk heatmap</h3>
        </div>
      </div>
      <div className="heatmap-grid">
        {cells.map((cell) => (
          <div className="heatmap-cell" key={cell.label}>
            <strong>{cell.label}</strong>
            <span>{cell.count} incidents</span>
            <p>{cell.summary}</p>
            {cell.incidents[0] ? <small>{cell.incidents[0].reference}: {cell.incidents[0].ownerTeam}</small> : null}
          </div>
        ))}
      </div>
    </article>
  );
}

function RiskView({
  title,
  incidents,
  emptyCopy,
  mode,
}: {
  title: string;
  incidents: Incident[];
  emptyCopy: string;
  mode: "reconciliation" | "sla";
}) {
  const topIncidents = [...incidents].sort((a, b) => b.riskScore - a.riskScore).slice(0, 3);
  const reconciliationSummary =
    mode === "reconciliation"
      ? [
          {
            label: "Reconciliation mismatch cases",
            incidents: incidents.filter((incident) => incident.category === "Reconciliation Mismatch"),
          },
          {
            label: "Duplicate debit cases",
            incidents: incidents.filter((incident) => incident.category === "Duplicate Debit"),
          },
          {
            label: "Settlement/file exception cases",
            incidents: incidents.filter((incident) =>
              ["Settlement Delay", "File Processing Exception"].includes(incident.category),
            ),
          },
          {
            label: "High reconciliation priority cases",
            incidents: incidents.filter((incident) =>
              ["Critical reconciliation break", "High-priority reconciliation review"].includes(incident.reconciliationPriority),
            ),
          },
        ]
      : [];
  const slaSummary =
    mode === "sla"
      ? [
          {
            label: "High SLA risk cases",
            incidents: incidents.filter((incident) => ["Breached", "Escalation Required"].includes(incident.slaStatus)),
          },
          {
            label: "Breached or urgent cases",
            incidents: incidents.filter((incident) => incident.slaStatus === "Breached" || incident.slaStatus === "Escalation Required"),
          },
          {
            label: "Incidents requiring escalation",
            incidents: incidents.filter((incident) => incident.escalationRequirement.toLowerCase().includes("escalation")),
          },
        ]
      : [];

  return (
    <article className="panel">
      <h3>{title}</h3>
      {mode === "reconciliation" ? (
        <div className="risk-summary-grid">
          {reconciliationSummary.map((item) => (
            <SummaryBucket key={item.label} label={item.label} incidents={item.incidents} />
          ))}
        </div>
      ) : null}
      {mode === "sla" ? (
        <div className="risk-summary-grid">
          {slaSummary.map((item) => (
            <SummaryBucket key={item.label} label={item.label} incidents={item.incidents} />
          ))}
        </div>
      ) : null}
      <div className="incident-list">
        {topIncidents.length > 0 ? (
          topIncidents.map((incident) => (
            <div className="incident-row" key={incident.id}>
              <div>
                <strong>{incident.reference}: {incident.paymentType}</strong>
                <span>{incident.category} - {incident.ownerTeam}</span>
                <span>
                  {mode === "reconciliation"
                    ? `Suggested reconciliation follow-up: ${incident.reconciliationPriority}. ${incident.recommendedAction}`
                    : `Escalation path: ${incident.escalationRequirement} Owner action: ${incident.recommendedAction}`}
                </span>
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

function SummaryBucket({ label, incidents }: { label: string; incidents: Incident[] }) {
  const sample = incidents[0];

  return (
    <div className="risk-summary-item">
      <strong>{label}</strong>
      <span>{incidents.length} cases</span>
      {sample ? <small>{sample.reference}: {sample.category}</small> : <small>No cases currently visible</small>}
    </div>
  );
}
