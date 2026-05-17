import { getRepeatedPatternInsights, isReconciliationRisk } from "./incidentRules";
import { SEVERITIES, type Incident, type Severity } from "../types/incident";

export function buildManagementReport(incidents: Incident[]) {
  const totalExposure = incidents.reduce((total, incident) => total + incident.estimatedFinancialImpact, 0);
  const affectedCustomers = incidents.reduce((total, incident) => total + incident.affectedCustomers, 0);
  const reconciliationIncidents = incidents.filter(isReconciliationRisk);
  const highRiskOpen = incidents.filter(
    (incident) => !["Resolved", "Closed"].includes(incident.status) && ["Critical", "High"].includes(incident.riskLabel),
  );
  const escalationItems = incidents.filter((incident) => incident.slaStatus === "Escalation Required");
  const repeatedPatterns = getRepeatedPatternInsights(incidents);
  const highestRisk = [...incidents].sort((a, b) => b.riskScore - a.riskScore)[0] ?? null;
  const severityBreakdown = SEVERITIES.map((severity) => ({
    severity,
    count: incidents.filter((incident) => incident.severity === severity).length,
  }));

  return {
    totalIncidents: incidents.length,
    totalExposure,
    affectedCustomers,
    reconciliationIncidents,
    highRiskOpen,
    escalationItems,
    repeatedPatterns,
    highestRisk,
    severityBreakdown,
    operationalSummary: `${incidents.length} demo incidents are under review, with ${highRiskOpen.length} open high-risk items and ${reconciliationIncidents.length} reconciliation-sensitive cases. The current estimated exposure is GBP ${totalExposure.toLocaleString("en-GB")}.`,
    reconciliationSummary:
      reconciliationIncidents.length > 0
        ? `${reconciliationIncidents.length} reconciliation-sensitive incidents require payment operations review.`
        : "No reconciliation-sensitive incidents are currently present.",
    customerImpactSummary: `Total affected customers: ${affectedCustomers.toLocaleString("en-GB")}. Highest customer exposure: ${Math.max(0, ...incidents.map((incident) => incident.affectedCustomers)).toLocaleString("en-GB")} customers on a single incident.`,
    financialExposureSummary:
      highestRisk
        ? `${highestRisk.reference}: ${highestRisk.title} is the highest-risk exposure item. ${highestRisk.reportingNote}`
        : "No exposure data is available.",
    managementUpdate:
      "Current risk operations focus is on high-severity payment incidents, reconciliation breaks, SLA pressure, and customer-impacting payment exceptions. Demo outputs are structured for management communication and interview walkthroughs, not operational use with real banking data.",
    nextSteps:
      repeatedPatterns.length > 0
        ? repeatedPatterns.map((pattern) => `${pattern.category}: ${pattern.followUp}`)
        : ["Continue monitoring demo incidents, confirm ownership, and validate reconciliation evidence before closure."],
  };
}

export function getSeverityPercentage(count: number, total: number) {
  return total > 0 ? Math.round((count / total) * 100) : 0;
}

export function getSeverityClassName(severity: Severity) {
  return `severity-${severity.toLowerCase()}`;
}
