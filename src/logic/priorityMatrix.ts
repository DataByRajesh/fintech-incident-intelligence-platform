import { isReconciliationRisk } from "./incidentRules";
import type { Incident } from "../types/incident";

export interface PriorityMatrixCell {
  label: string;
  count: number;
  incidents: Incident[];
  summary: string;
}

export function buildPriorityMatrix(incidents: Incident[]): PriorityMatrixCell[] {
  const openIncidents = incidents.filter((incident) => !["Resolved", "Closed"].includes(incident.status));
  const criticalSla = openIncidents.filter(
    (incident) => incident.riskLabel === "Critical" && incident.slaStatus === "Escalation Required",
  );
  const highSla = openIncidents.filter(
    (incident) => ["Critical", "High"].includes(incident.riskLabel) && ["Breached", "At Risk"].includes(incident.slaStatus),
  );
  const reconciliation = openIncidents.filter(
    (incident) =>
      isReconciliationRisk(incident) &&
      ["Critical reconciliation break", "High-priority reconciliation review"].includes(incident.reconciliationPriority),
  );
  const customerExposure = openIncidents.filter(
    (incident) => incident.affectedCustomers >= 100 || incident.estimatedFinancialImpact >= 50_000,
  );

  return [
    {
      label: "Critical SLA pressure",
      count: criticalSla.length,
      incidents: criticalSla,
      summary: "Immediate owner action and management update required.",
    },
    {
      label: "High-risk SLA watch",
      count: highSla.length,
      incidents: highSla,
      summary: "Active monitoring needed before the next checkpoint.",
    },
    {
      label: "Reconciliation priority",
      count: reconciliation.length,
      incidents: reconciliation,
      summary: "Finance or payment operations evidence must be validated before closure.",
    },
    {
      label: "Customer or exposure pressure",
      count: customerExposure.length,
      incidents: customerExposure,
      summary: "Customer impact, exposure, or communications need operational oversight.",
    },
  ];
}
