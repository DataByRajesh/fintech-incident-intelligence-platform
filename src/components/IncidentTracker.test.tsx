import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { demoIncidents } from "../data/demoIncidents";
import { IncidentTracker } from "./IncidentTracker";

describe("IncidentTracker", () => {
  it("renders incidents with operational tracker fields", () => {
    render(
      <IncidentTracker
        incidents={demoIncidents}
        selectedIncidentId={null}
        onSelectIncident={vi.fn()}
        onUpdateStatus={vi.fn()}
      />,
    );

    expect(screen.getByText("Faster Payments settlement delay")).toBeInTheDocument();
    expect(screen.getByText("Reconciliation priority")).toBeInTheDocument();
    expect(screen.getAllByText("Recommended next action").length).toBeGreaterThan(0);
  });

  it("filters incidents by search text", async () => {
    const user = userEvent.setup();
    render(
      <IncidentTracker
        incidents={demoIncidents}
        selectedIncidentId={null}
        onSelectIncident={vi.fn()}
        onUpdateStatus={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText(/search incidents/i), "SWIFT");

    const trackerTable = screen.getByRole("table");
    expect(within(trackerTable).getByText("FIN-0010")).toBeInTheDocument();
    expect(within(trackerTable).queryByText("FIN-0001")).not.toBeInTheDocument();
    expect(screen.getByText("of 10 incidents shown")).toBeInTheDocument();
  });

  it("filters incidents by severity, status, and payment type", async () => {
    const user = userEvent.setup();
    render(
      <IncidentTracker
        incidents={demoIncidents}
        selectedIncidentId={null}
        onSelectIncident={vi.fn()}
        onUpdateStatus={vi.fn()}
      />,
    );

    await user.selectOptions(screen.getByLabelText("Severity"), "Critical");
    await user.selectOptions(screen.getByLabelText("Status"), "Escalated");
    await user.selectOptions(screen.getByLabelText("Payment type"), "CHAPS");

    const trackerTable = screen.getByRole("table");
    expect(within(trackerTable).getByText("FIN-0008")).toBeInTheDocument();
    expect(within(trackerTable).queryByText("FIN-0003")).not.toBeInTheDocument();
  });

  it("sorts incidents by SLA risk", async () => {
    const user = userEvent.setup();
    render(
      <IncidentTracker
        incidents={demoIncidents}
        selectedIncidentId={null}
        onSelectIncident={vi.fn()}
        onUpdateStatus={vi.fn()}
      />,
    );

    await user.selectOptions(screen.getByLabelText("Sort by"), "SLA risk");

    const trackerRows = within(screen.getByRole("table")).getAllByRole("button");
    expect(trackerRows[0]).toHaveTextContent(/Escalation Required/);
    expect(trackerRows[0]).toHaveTextContent(/FIN-0003|FIN-0007|FIN-0008/);
  });

  it("opens a detail view and displays key incident fields", async () => {
    const user = userEvent.setup();
    function TrackerHarness() {
      const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
      return (
        <IncidentTracker
          incidents={demoIncidents}
          selectedIncidentId={selectedIncidentId}
          onSelectIncident={setSelectedIncidentId}
          onUpdateStatus={vi.fn()}
        />
      );
    }

    render(<TrackerHarness />);

    await user.click(screen.getByRole("button", { name: /card transaction reconciliation mismatch/i }));

    expect(screen.getByRole("heading", { name: "Card transaction reconciliation mismatch" })).toBeInTheDocument();
    expect(screen.getByText("Incident summary")).toBeInTheDocument();
    expect(screen.getAllByText("SLA risk").length).toBeGreaterThan(1);
    expect(screen.getByText("Customer/regulatory impact")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Reporting note" })).toBeInTheDocument();
  });

  it("calls status update callback and shows audit history", async () => {
    const user = userEvent.setup();
    const onUpdateStatus = vi.fn();
    render(
      <IncidentTracker
        incidents={demoIncidents}
        selectedIncidentId={demoIncidents[0].id}
        onSelectIncident={vi.fn()}
        onUpdateStatus={onUpdateStatus}
      />,
    );

    await user.selectOptions(screen.getByLabelText(`Update status for ${demoIncidents[0].reference}`), "Resolved");

    expect(onUpdateStatus).toHaveBeenCalledWith(demoIncidents[0].id, "Resolved");
    expect(screen.getByRole("heading", { name: "Audit trail" })).toBeInTheDocument();
    expect(within(screen.getByText("Audit trail").closest("article")!).getByText("Created: New")).toBeInTheDocument();
  });

  it("shows reconciliation and SLA escalation views with relevant actions", () => {
    render(
      <IncidentTracker
        incidents={demoIncidents}
        selectedIncidentId={null}
        onSelectIncident={vi.fn()}
        onUpdateStatus={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Reconciliation Risk View" })).toBeInTheDocument();
    expect(screen.getAllByText(/suggested reconciliation follow-up/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "SLA & Escalation View" })).toBeInTheDocument();
    expect(screen.getAllByText(/escalation path/i).length).toBeGreaterThan(0);
  });
});
