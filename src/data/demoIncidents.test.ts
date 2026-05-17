import { describe, expect, it } from "vitest";
import { INCIDENT_CATEGORIES } from "../types/incident";
import { demoIncidents } from "./demoIncidents";

const acceptedPaymentTypes = ["Faster Payments", "BACS", "CHAPS", "Card", "Open Banking", "SWIFT", "SEPA"];
const forbiddenRealDataPatterns = [
  /\b\d{16}\b/,
  /\b\d{6}-\d{8}\b/,
  /\b\d{8}\b/,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\b(john smith|jane doe|real customer|cardholder name)\b/i,
];

describe("demoIncidents", () => {
  it("is not empty", () => {
    expect(demoIncidents.length).toBeGreaterThan(0);
  });

  it("keeps every demo incident complete and classified", () => {
    for (const incident of demoIncidents) {
      expect(incident.id).toBeTruthy();
      expect(incident.reference).toMatch(/^FIN-\d{4}$/);
      expect(incident.title).toBeTruthy();
      expect(incident.description).toBeTruthy();
      expect(incident.paymentType).toBeTruthy();
      expect(incident.category).toBeTruthy();
      expect(incident.severity).toBeTruthy();
      expect(incident.riskLabel).toBeTruthy();
      expect(incident.recommendedAction).toBeTruthy();
      expect(incident.reportingNote).toBeTruthy();
    }
  });

  it("does not include obvious real customer, card, bank account, or personal identifiers", () => {
    for (const incident of demoIncidents) {
      const searchable = [incident.title, incident.description, incident.reportedBy, incident.affectedService, incident.notes].join(" ");

      for (const pattern of forbiddenRealDataPatterns) {
        expect(searchable).not.toMatch(pattern);
      }
    }
  });

  it("uses accepted payment types and incident categories", () => {
    for (const incident of demoIncidents) {
      expect(acceptedPaymentTypes).toContain(incident.paymentType);
      expect(INCIDENT_CATEGORIES).toContain(incident.category);
    }
  });

  it("includes the required fintech demo scenarios", () => {
    const titles = demoIncidents.map((incident) => incident.title.toLowerCase()).join(" | ");

    expect(titles).toContain("faster payments settlement delay");
    expect(titles).toContain("card transaction reconciliation mismatch");
    expect(titles).toContain("duplicate customer debit investigation");
    expect(titles).toContain("open banking payment initiation failure");
    expect(titles).toContain("chargeback spike review");
    expect(titles).toContain("bacs file processing exception");
    expect(titles).toContain("suspicious transaction alert");
    expect(titles).toContain("chaps high-value payment delay");
    expect(titles).toContain("sepa settlement exception");
    expect(titles).toContain("swift payment investigation");
  });
});
