import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { demoIncidents } from "../data/demoIncidents";
import { Reports } from "./Reports";

describe("Reports", () => {
  it("renders structured management report headings", () => {
    render(<Reports incidents={demoIncidents} />);

    expect(screen.getByRole("heading", { name: "Reports" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Operational summary" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Severity breakdown" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Reconciliation summary" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "SLA/escalation summary" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Customer impact summary" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Financial exposure" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Management update" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Next steps" })).toBeInTheDocument();
  });

  it("renders report metrics and summary content", () => {
    render(<Reports incidents={demoIncidents} />);

    expect(screen.getByText("Total incidents")).toBeInTheDocument();
    expect(screen.getByText(String(demoIncidents.length))).toBeInTheDocument();
    expect(screen.getAllByText(/Reconciliation Mismatch/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/incidents have SLA risk/i)).toBeInTheDocument();
    expect(screen.getByText(/FIN-0003: Duplicate customer debit investigation/i)).toBeInTheDocument();
    expect(screen.getAllByText(/GBP 1,855,800/i).length).toBeGreaterThan(0);
  });

  it("copies the generated management report to clipboard", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<Reports incidents={demoIncidents} />);

    await user.click(screen.getByRole("button", { name: /copy report/i }));

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("Operational Management Report"));
    expect(screen.getByText(/report copied to clipboard/i)).toBeInTheDocument();
  });
});
