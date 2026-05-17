import { getIncidentTimeline } from "./activityTimeline";
import { getRepeatedPatternInsights, isReconciliationRisk } from "./incidentRules";
import { summarizeSlaMetrics } from "./slaMetrics";
import { SEVERITIES, type Incident, type Severity } from "../types/incident";

export function buildManagementReport(incidents: Incident[]) {
  const totalExposure = incidents.reduce((total, incident) => total + incident.estimatedFinancialImpact, 0);
  const affectedCustomers = incidents.reduce((total, incident) => total + incident.affectedCustomers, 0);
  const reconciliationIncidents = incidents.filter(isReconciliationRisk);
  const highRiskOpen = incidents.filter(
    (incident) => !["Resolved", "Closed"].includes(incident.status) && ["Critical", "High"].includes(incident.riskLabel),
  );
  const escalationItems = incidents.filter((incident) => incident.slaStatus === "Escalation Required");
  const slaRiskItems = incidents.filter((incident) => ["At Risk", "Breached", "Escalation Required"].includes(incident.slaStatus));
  const repeatedPatterns = getRepeatedPatternInsights(incidents);
  const slaAgeingSummary = summarizeSlaMetrics(incidents);
  const timelineEvents = incidents.flatMap((incident) =>
    getIncidentTimeline(incident).map((event) => ({ incident, event })),
  );
  const recentCriticalHighActivity = timelineEvents
    .filter(({ incident }) => ["Critical", "High"].includes(incident.riskLabel))
    .sort((a, b) => Date.parse(b.event.timestamp) - Date.parse(a.event.timestamp))
    .slice(0, 3);
  const latestStatusChanges = timelineEvents
    .filter(({ event }) => event.type === "Status Updated")
    .sort((a, b) => Date.parse(b.event.timestamp) - Date.parse(a.event.timestamp))
    .slice(0, 3);
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
    slaRiskItems,
    repeatedPatterns,
    slaAgeingSummary,
    activitySummary: {
      recentCriticalHighActivity,
      latestStatusChanges,
      followUpIncidents: highRiskOpen.slice(0, 3),
      summary:
        recentCriticalHighActivity.length > 0
          ? `${recentCriticalHighActivity.length} recent critical/high-risk activity events are visible. ${latestStatusChanges.length} latest status changes are captured. ${highRiskOpen.length} incidents require follow-up.`
          : "No recent critical/high-risk activity events are currently visible.",
    },
    highestRisk,
    severityBreakdown,
    operationalSummary: `${incidents.length} demo incidents are under review, with ${highRiskOpen.length} open high-risk items and ${reconciliationIncidents.length} reconciliation-sensitive cases. The current estimated exposure is GBP ${totalExposure.toLocaleString("en-GB")}.`,
    reconciliationSummary:
      reconciliationIncidents.length > 0
        ? `${reconciliationIncidents.length} reconciliation-sensitive incidents require payment operations review.`
        : "No reconciliation-sensitive incidents are currently present.",
    slaEscalationSummary:
      slaRiskItems.length > 0
        ? `${slaRiskItems.length} incidents have SLA risk, including ${escalationItems.length} requiring formal escalation. SLA ageing shows ${slaAgeingSummary.breachedCount} breached and ${slaAgeingSummary.atRiskCount} at-risk active incidents. Next escalation: ${slaAgeingSummary.nextEscalationRecommendation}`
        : "No incidents currently show SLA or escalation pressure.",
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

export function buildReportExport(incidents: Incident[]) {
  const report = buildManagementReport(incidents);

  return {
    generatedAt: new Date().toISOString(),
    reportType: "Operational incident management summary",
    metrics: {
      totalIncidents: report.totalIncidents,
      totalExposure: report.totalExposure,
      affectedCustomers: report.affectedCustomers,
      highRiskOpen: report.highRiskOpen.length,
      escalationRequired: report.escalationItems.length,
      slaAgeingBreached: report.slaAgeingSummary.breachedCount,
      slaAgeingAtRisk: report.slaAgeingSummary.atRiskCount,
      reconciliationSensitive: report.reconciliationIncidents.length,
    },
    summaries: {
      operational: report.operationalSummary,
      reconciliation: report.reconciliationSummary,
      slaEscalation: report.slaEscalationSummary,
      slaAgeing: report.slaAgeingSummary,
      activity: report.activitySummary.summary,
      customerImpact: report.customerImpactSummary,
      financialExposure: report.financialExposureSummary,
      managementUpdate: report.managementUpdate,
      nextSteps: report.nextSteps,
    },
    incidents: incidents.map((incident) => ({
      reference: incident.reference,
      title: incident.title,
      category: incident.category,
      paymentType: incident.paymentType,
      severity: incident.severity,
      riskLabel: incident.riskLabel,
      riskScore: incident.riskScore,
      slaStatus: incident.slaStatus,
      status: incident.status,
      ownerTeam: incident.ownerTeam,
      affectedCustomers: incident.affectedCustomers,
      transactionCount: incident.transactionCount,
      estimatedFinancialImpact: incident.estimatedFinancialImpact,
      reportingNote: incident.reportingNote,
      updatedAt: incident.updatedAt,
    })),
  };
}

export function buildReportText(incidents: Incident[]) {
  const report = buildManagementReport(incidents);
  const severityLines = report.severityBreakdown
    .map((item) => `- ${item.severity}: ${item.count}`)
    .join("\n");
  const nextSteps = report.nextSteps.map((step) => `- ${step}`).join("\n");

  return [
    "Fintech Incident Intelligence & Risk Operations Platform",
    "Operational Management Report",
    "",
    "Operational summary",
    report.operationalSummary,
    "",
    "Severity breakdown",
    severityLines,
    "",
    "Reconciliation summary",
    report.reconciliationSummary,
    "",
    "SLA/escalation summary",
    report.slaEscalationSummary,
    "",
    "Activity summary",
    report.activitySummary.summary,
    "",
    "Customer impact summary",
    report.customerImpactSummary,
    "",
    "Financial exposure summary",
    report.financialExposureSummary,
    "",
    "Management update",
    report.managementUpdate,
    "",
    "Next steps",
    nextSteps,
  ].join("\n");
}

export function createReportTextDownloadHref(incidents: Incident[]) {
  return `data:text/plain;charset=utf-8,${encodeURIComponent(buildReportText(incidents))}`;
}

export function getSeverityPercentage(count: number, total: number) {
  return total > 0 ? Math.round((count / total) * 100) : 0;
}

export function getSeverityClassName(severity: Severity) {
  return `severity-${severity.toLowerCase()}`;
}
