import { isReconciliationRisk } from "./incidentRules";
import type { Incident } from "../types/incident";

export function buildDashboardMetrics(incidents: Incident[]) {
  const openIncidents = incidents.filter((incident) => !["Resolved", "Closed"].includes(incident.status));
  const criticalHighIncidents = incidents.filter((incident) => ["Critical", "High"].includes(incident.riskLabel));
  const highRiskOpenIncidents = openIncidents.filter((incident) => ["Critical", "High"].includes(incident.riskLabel));
  const slaRiskIncidents = incidents.filter((incident) =>
    ["Breached", "Escalation Required"].includes(incident.slaStatus),
  );
  const reconciliationBreaks = incidents.filter(isReconciliationRisk);
  const estimatedFinancialExposure = incidents.reduce((total, incident) => total + incident.estimatedFinancialImpact, 0);
  const affectedCustomerTotal = incidents.reduce((total, incident) => total + incident.affectedCustomers, 0);
  const recentHighRiskIncidents = [...criticalHighIncidents]
    .sort((a, b) => b.riskScore - a.riskScore || Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 5);

  return {
    totalIncidents: incidents.length,
    criticalHighIncidents: criticalHighIncidents.length,
    openIncidents: openIncidents.length,
    slaRiskCount: slaRiskIncidents.length,
    reconciliationBreaks: reconciliationBreaks.length,
    estimatedFinancialExposure,
    affectedCustomerTotal,
    recentHighRiskIncidents,
    highRiskOpenIncidents: highRiskOpenIncidents.length,
  };
}
