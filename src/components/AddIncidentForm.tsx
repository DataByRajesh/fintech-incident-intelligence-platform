import { useMemo, useState } from "react";
import { INCIDENT_CATEGORIES, type ImpactLevel, type IncidentDraft, type PaymentType, type WorkaroundAvailability } from "../types/incident";

const impactOptions: ImpactLevel[] = ["Low", "Medium", "High", "Critical"];
const workaroundOptions: WorkaroundAvailability[] = ["Available", "Partial", "Unavailable"];
const paymentTypeOptions: PaymentType[] = [
  "Faster Payments",
  "BACS",
  "CHAPS",
  "Card",
  "Open Banking",
  "SWIFT",
  "SEPA",
];

const emptyDraft: IncidentDraft = {
  title: "",
  description: "",
  reportedBy: "",
  affectedService: "",
  paymentType: "Faster Payments",
  incidentCategory: "Unknown / Needs Review",
  affectedCustomers: 0,
  transactionCount: 0,
  estimatedFinancialImpact: 0,
  customerImpact: "Medium",
  financialImpact: "Medium",
  slaUrgency: "Medium",
  systemImpact: "Medium",
  complianceSensitivity: "Medium",
  workaroundAvailability: "Partial",
  ownerTeam: "",
  notes: "",
};

interface AddIncidentFormProps {
  onSubmit: (draft: IncidentDraft) => void;
}

export function AddIncidentForm({ onSubmit }: AddIncidentFormProps) {
  const [draft, setDraft] = useState<IncidentDraft>(emptyDraft);
  const [error, setError] = useState("");

  const missingFields = useMemo(
    () =>
      [
        ["title", draft.title],
        ["description", draft.description],
        ["reported by", draft.reportedBy],
        ["affected service", draft.affectedService],
        ["owner/team", draft.ownerTeam],
      ].filter(([, value]) => !String(value).trim()),
    [draft],
  );

  const canSubmit = missingFields.length === 0;

  function updateField<Key extends keyof IncidentDraft>(key: Key, value: IncidentDraft[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function submitDraft() {
    if (!canSubmit) {
      setError(`Add incident details before submitting: ${missingFields.map(([label]) => label).join(", ")}.`);
      return;
    }

    onSubmit({
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      reportedBy: draft.reportedBy.trim(),
      affectedService: draft.affectedService.trim(),
      ownerTeam: draft.ownerTeam.trim(),
      notes: draft.notes.trim(),
      affectedCustomers: Math.max(0, Math.round(draft.affectedCustomers)),
      transactionCount: Math.max(0, Math.round(draft.transactionCount)),
      estimatedFinancialImpact: Math.max(0, draft.estimatedFinancialImpact),
    });
    setDraft(emptyDraft);
  }

  function resetForm() {
    setDraft(emptyDraft);
    setError("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitDraft();
  }

  return (
    <section className="screen">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Incident intake</p>
          <h2>Payment Incident Triage & Reconciliation Workbench</h2>
        </div>
      </div>

      <form className="form-panel" onSubmit={handleSubmit} noValidate>
        <div className="disclaimer-message">
          Demo-only workspace. Do not enter real customer, transaction, account, or banking data.
        </div>
        {error ? <div className="error-message">{error}</div> : null}

        <div className="form-grid">
          <label>
            Incident title
            <input
              value={draft.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Payment provider API timeout"
            />
          </label>
          <SelectField
            label="Payment rail/type"
            value={draft.paymentType}
            options={paymentTypeOptions}
            onChange={(value) => updateField("paymentType", value)}
          />
          <label>
            Reported by
            <input
              value={draft.reportedBy}
              onChange={(event) => updateField("reportedBy", event.target.value)}
              placeholder="Production Support"
            />
          </label>
          <label>
            Owner/team
            <input
              value={draft.ownerTeam}
              onChange={(event) => updateField("ownerTeam", event.target.value)}
              placeholder="Payments Operations"
            />
          </label>
          <SelectField
            label="Incident category"
            value={draft.incidentCategory}
            options={[...INCIDENT_CATEGORIES]}
            onChange={(value) => updateField("incidentCategory", value)}
          />
          <label>
            Affected service
            <input
              value={draft.affectedService}
              onChange={(event) => updateField("affectedService", event.target.value)}
              placeholder="Payment gateway"
            />
          </label>
          <label className="span-2">
            Description
            <textarea
              value={draft.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Describe what happened, who is affected, and any known operational impact."
              rows={5}
            />
          </label>
          <label>
            Affected customers
            <input
              min="0"
              type="number"
              value={draft.affectedCustomers}
              onChange={(event) => updateField("affectedCustomers", Number(event.target.value))}
              placeholder="125"
            />
          </label>
          <label>
            Transaction count
            <input
              min="0"
              type="number"
              value={draft.transactionCount}
              onChange={(event) => updateField("transactionCount", Number(event.target.value))}
              placeholder="420"
            />
          </label>
          <label>
            Estimated financial impact (GBP)
            <input
              min="0"
              step="100"
              type="number"
              value={draft.estimatedFinancialImpact}
              onChange={(event) => updateField("estimatedFinancialImpact", Number(event.target.value))}
              placeholder="25000"
            />
          </label>
          <SelectField
            label="Customer impact"
            value={draft.customerImpact}
            options={impactOptions}
            onChange={(value) => updateField("customerImpact", value)}
          />
          <SelectField
            label="Financial impact"
            value={draft.financialImpact}
            options={impactOptions}
            onChange={(value) => updateField("financialImpact", value)}
          />
          <SelectField
            label="SLA urgency"
            value={draft.slaUrgency}
            options={impactOptions}
            onChange={(value) => updateField("slaUrgency", value)}
          />
          <SelectField
            label="System/ICT impact"
            value={draft.systemImpact}
            options={impactOptions}
            onChange={(value) => updateField("systemImpact", value)}
          />
          <SelectField
            label="Compliance sensitivity"
            value={draft.complianceSensitivity}
            options={impactOptions}
            onChange={(value) => updateField("complianceSensitivity", value)}
          />
          <SelectField
            label="Workaround availability"
            value={draft.workaroundAvailability}
            options={workaroundOptions}
            onChange={(value) => updateField("workaroundAvailability", value)}
          />
          <label className="span-2">
            Notes
            <textarea
              value={draft.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder="Add reconciliation notes, provider references, customer handling details, or current assumptions."
              rows={4}
            />
          </label>
        </div>

        {!canSubmit ? (
          <p className="disabled-reason" id="submit-disabled-reason">
            Submit is available after the required incident details are complete.
          </p>
        ) : null}
        <div className="form-actions">
          <button
            aria-describedby={!canSubmit ? "submit-disabled-reason" : undefined}
            className="primary-action"
            disabled={!canSubmit}
            title={!canSubmit ? "Complete the required incident details before classifying." : "Classify incident"}
            type="submit"
          >
            Classify incident
          </button>
          <button className="secondary-action" onClick={resetForm} type="button">
            Clear form
          </button>
        </div>
      </form>
    </section>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (value: T) => void;
}) {
  return (
    <label>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
