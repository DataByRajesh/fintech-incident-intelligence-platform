import { useMemo, useState } from "react";
import type { ImpactLevel, IncidentDraft, WorkaroundAvailability } from "../types/incident";

const impactOptions: ImpactLevel[] = ["Low", "Medium", "High", "Critical"];
const workaroundOptions: WorkaroundAvailability[] = ["Available", "Partial", "Unavailable"];

const emptyDraft: IncidentDraft = {
  title: "",
  description: "",
  reportedBy: "",
  affectedService: "",
  customerImpact: "Medium",
  financialImpact: "Medium",
  slaUrgency: "Medium",
  systemImpact: "Medium",
  complianceSensitivity: "Medium",
  workaroundAvailability: "Partial",
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
    });
    setDraft(emptyDraft);
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
          <h2>Add Incident</h2>
        </div>
      </div>

      <form className="form-panel" onSubmit={handleSubmit} noValidate>
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
          <label>
            Reported by
            <input
              value={draft.reportedBy}
              onChange={(event) => updateField("reportedBy", event.target.value)}
              placeholder="Production Support"
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
            Affected service
            <input
              value={draft.affectedService}
              onChange={(event) => updateField("affectedService", event.target.value)}
              placeholder="Payment gateway"
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
        </div>

        {!canSubmit ? (
          <p className="disabled-reason" id="submit-disabled-reason">
            Submit is available after the required incident details are complete.
          </p>
        ) : null}
        <button
          aria-describedby={!canSubmit ? "submit-disabled-reason" : undefined}
          className="primary-action"
          disabled={!canSubmit}
          onClick={submitDraft}
          title={!canSubmit ? "Complete the required incident details before classifying." : "Classify incident"}
          type="button"
        >
          Classify incident
        </button>
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
