import type { Incident, IncidentCategory, IncidentStatus, IncidentTimelineItem, IncidentTimelineType } from "../types/incident";

const reconciliationCategories: IncidentCategory[] = [
  "Reconciliation Mismatch",
  "Settlement Delay",
  "Duplicate Debit",
  "Chargeback Spike",
  "File Processing Exception",
  "High-Value Payment Delay",
  "Payment Investigation",
  "Refund / Settlement Issue",
  "Data Mismatch",
];

function isTimelineReconciliationRisk(incident: Pick<Incident, "category">) {
  return reconciliationCategories.includes(incident.category);
}

function timelineId(incident: Pick<Incident, "id">, type: IncidentTimelineType, suffix: string) {
  return `${incident.id}-${type.toLowerCase().replaceAll(" ", "-")}-${suffix}`;
}

function item(
  incident: Pick<Incident, "id">,
  type: IncidentTimelineType,
  timestamp: string,
  label: string,
  description: string,
  suffix: string,
): IncidentTimelineItem {
  return {
    id: timelineId(incident, type, suffix),
    timestamp,
    type,
    label,
    description,
  };
}

export function buildInitialTimeline(incident: Omit<Incident, "timeline">): IncidentTimelineItem[] {
  const events: IncidentTimelineItem[] = [
    item(
      incident,
      "Created",
      incident.createdAt,
      "Incident created",
      `${incident.reference} was logged by ${incident.reportedBy} for ${incident.paymentType}.`,
      "created",
    ),
    item(
      incident,
      "Classified",
      incident.createdAt,
      "Severity classified",
      `Classified as ${incident.severity} ${incident.category} with ${incident.riskLabel.toLowerCase()} risk.`,
      "classified",
    ),
  ];

  if (incident.escalationRequirement.toLowerCase().includes("escalation")) {
    events.push(
      item(
        incident,
        "Escalation Recommended",
        incident.createdAt,
        "Escalation recommended",
        incident.escalationRequirement,
        "escalation",
      ),
    );
  }

  if (isTimelineReconciliationRisk(incident)) {
    events.push(
      item(
        incident,
        "Reconciliation Review",
        incident.createdAt,
        "Reconciliation review required",
        `${incident.reconciliationPriority}. ${incident.reportingNote}`,
        "reconciliation",
      ),
    );
  }

  events.push(
    item(incident, "Reported", incident.updatedAt, "Reporting note prepared", incident.reportingNote, "reported"),
  );

  return sortTimeline(events);
}

export function createStatusTimelineEvent(
  incident: Pick<Incident, "id" | "reference">,
  status: IncidentStatus,
  previousStatus: IncidentStatus,
  timestamp: string,
): IncidentTimelineItem {
  return item(
    incident,
    "Status Updated",
    timestamp,
    "Status updated",
    `${incident.reference} status changed from ${previousStatus} to ${status}.`,
    `status-${Date.parse(timestamp) || Date.now()}`,
  );
}

export function getIncidentTimeline(incident: Incident): IncidentTimelineItem[] {
  const existing = Array.isArray(incident.timeline) ? incident.timeline : [];
  return sortTimeline(existing.length > 0 ? existing : buildInitialTimeline(incident));
}

export function sortTimeline(events: IncidentTimelineItem[]) {
  return [...events].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
}
