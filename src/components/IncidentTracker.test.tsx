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
        onUpdateOwner={vi.fn()}
        onUpdateStatus={vi.fn()}
      />,
    );

    expect(screen.getByText("Faster Payments settlement delay")).toBeInTheDocument();
    expect(screen.getAllByText("Reconciliation priority").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Recommended next action").length).toBeGreaterThan(0);
  });

  it("filters incidents by search text", async () => {
    const user = userEvent.setup();
    render(
      <IncidentTracker
        incidents={demoIncidents}
        selectedIncidentId={null}
        onSelectIncident={vi.fn()}
        onUpdateOwner={vi.fn()}
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
        onUpdateOwner={vi.fn()}
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
        onUpdateOwner={vi.fn()}
        onUpdateStatus={vi.fn()}
      />,
    );

    await user.selectOptions(screen.getByLabelText("Sort by"), "SLA risk");

    const trackerRows = within(screen.getByRole("table")).getAllByRole("button");
    expect(trackerRows[0]).toHaveTextContent(/FIN-0003|FIN-0007|FIN-0008/);
    expect(trackerRows[0]).toHaveTextContent(/target/);
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
          onUpdateOwner={vi.fn()}
          onUpdateStatus={vi.fn()}
        />
      );
    }

    render(<TrackerHarness />);

    await user.click(screen.getByRole("button", { name: /card transaction reconciliation mismatch/i }));

    expect(screen.getByRole("heading", { name: "Card transaction reconciliation mismatch" })).toBeInTheDocument();
    expect(screen.getByText("Incident summary")).toBeInTheDocument();
    expect(screen.getAllByText("SLA risk").length).toBeGreaterThan(1);
    expect(screen.getByText("Created")).toBeInTheDocument();
    expect(screen.getByText("SLA target")).toBeInTheDocument();
    expect(screen.getAllByText(/target/i).length).toBeGreaterThan(0);
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
        onUpdateOwner={vi.fn()}
        onUpdateStatus={onUpdateStatus}
      />,
    );

    await user.selectOptions(screen.getByLabelText(`Update status for ${demoIncidents[0].reference}`), "Resolved");

    expect(onUpdateStatus).toHaveBeenCalledWith(demoIncidents[0].id, "Resolved");
    expect(screen.getByRole("heading", { name: "Activity timeline" })).toBeInTheDocument();
    expect(within(screen.getByText("Activity timeline").closest("article")!).getByText("Incident created")).toBeInTheDocument();
    expect(within(screen.getByText("Activity timeline").closest("article")!).getByText("Severity classified")).toBeInTheDocument();
  });

  it("calls owner assignment callback from the detail view", async () => {
    const user = userEvent.setup();
    const onUpdateOwner = vi.fn();
    render(
      <IncidentTracker
        incidents={demoIncidents}
        selectedIncidentId={demoIncidents[0].id}
        onSelectIncident={vi.fn()}
        onUpdateOwner={onUpdateOwner}
        onUpdateStatus={vi.fn()}
      />,
    );

    await user.selectOptions(screen.getByLabelText(`Assign owner/team for ${demoIncidents[0].reference}`), "Finance Operations");

    expect(onUpdateOwner).toHaveBeenCalledWith(demoIncidents[0].id, "Finance Operations");
  });

  it("shows the risk heatmap priority matrix", () => {
    render(
      <IncidentTracker
        incidents={demoIncidents}
        selectedIncidentId={null}
        onSelectIncident={vi.fn()}
        onUpdateOwner={vi.fn()}
        onUpdateStatus={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Risk heatmap" })).toBeInTheDocument();
    expect(screen.getByText("Critical SLA pressure")).toBeInTheDocument();
    expect(screen.getAllByText("Reconciliation priority").length).toBeGreaterThan(0);
  });

  it("shows reconciliation view with relevant case categories and follow-up", () => {
    render(
      <IncidentTracker
        incidents={demoIncidents}
        selectedIncidentId={null}
        onSelectIncident={vi.fn()}
        onUpdateOwner={vi.fn()}
        onUpdateStatus={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Reconciliation Risk View" })).toBeInTheDocument();
    expect(screen.getByText("Reconciliation mismatch cases")).toBeInTheDocument();
    expect(screen.getByText("Duplicate debit cases")).toBeInTheDocument();
    expect(screen.getByText("Settlement/file exception cases")).toBeInTheDocument();
    expect(screen.getByText("High reconciliation priority cases")).toBeInTheDocument();
    expect(screen.getAllByText(/suggested reconciliation follow-up/i).length).toBeGreaterThan(0);
  });

  it("shows SLA escalation view with urgent cases, escalation path, and owner action", () => {
    render(
      <IncidentTracker
        incidents={demoIncidents}
        selectedIncidentId={null}
        onSelectIncident={vi.fn()}
        onUpdateOwner={vi.fn()}
        onUpdateStatus={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "SLA & Escalation View" })).toBeInTheDocument();
    expect(screen.getByText("High SLA risk cases")).toBeInTheDocument();
    expect(screen.getByText("Breached or urgent cases")).toBeInTheDocument();
    expect(screen.getByText("Incidents requiring escalation")).toBeInTheDocument();
    expect(screen.getAllByText(/target/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/review within|escalate/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/escalation path/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/owner action/i).length).toBeGreaterThan(0);
  });
});
