import { demoIncidents } from "./demoIncidents";
import type { Incident } from "../types/incident";

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  incidents: Incident[];
}

export const demoScenarios: DemoScenario[] = [
  {
    id: "full",
    name: "Full operations portfolio",
    description: "All demo payment incidents across dashboard, tracker, and reports.",
    incidents: demoIncidents,
  },
  {
    id: "reconciliation",
    name: "Reconciliation pressure",
    description: "Mismatch, duplicate debit, settlement, and file exception cases.",
    incidents: demoIncidents.filter((incident) =>
      ["Reconciliation Mismatch", "Duplicate Debit", "Settlement Delay", "File Processing Exception"].includes(incident.category),
    ),
  },
  {
    id: "executive",
    name: "Executive escalation",
    description: "Critical SLA and high-value incidents that need management attention.",
    incidents: demoIncidents.filter(
      (incident) => incident.slaStatus === "Escalation Required" || incident.riskLabel === "Critical",
    ),
  },
  {
    id: "customer-impact",
    name: "Customer impact review",
    description: "High customer count or customer-sensitive payment incidents.",
    incidents: demoIncidents.filter((incident) => incident.affectedCustomers >= 100 || incident.customerImpact === "High"),
  },
];

export function getDemoScenario(id: string) {
  return demoScenarios.find((scenario) => scenario.id === id) ?? demoScenarios[0];
}
