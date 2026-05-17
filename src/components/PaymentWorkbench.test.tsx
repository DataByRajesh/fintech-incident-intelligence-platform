import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AddIncidentForm } from "./AddIncidentForm";

describe("Payment Incident Triage & Reconciliation Workbench", () => {
  it("keeps classification disabled until required incident details are complete", () => {
    render(<AddIncidentForm onSubmit={vi.fn()} />);

    expect(screen.getByRole("button", { name: /classify incident/i })).toBeDisabled();
    expect(screen.getByText(/submit is available after/i)).toBeInTheDocument();
    expect(screen.getByText(/do not enter real customer/i)).toBeInTheDocument();
  });

  it("submits a normalized payment incident draft", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AddIncidentForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/incident title/i), { target: { value: "BACS file processing exception" } });
    fireEvent.change(screen.getByLabelText(/reported by/i), { target: { value: "Back Office Operations" } });
    fireEvent.change(screen.getByLabelText(/owner\/team/i), { target: { value: "Back Office Operations" } });
    fireEvent.change(screen.getByLabelText(/affected service/i), { target: { value: "BACS file processing" } });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "BACS payment file processing exception stopped a submitted batch." },
    });
    fireEvent.change(screen.getByLabelText(/affected customers/i), { target: { value: "510" } });
    fireEvent.change(screen.getByLabelText(/transaction count/i), { target: { value: "2200" } });
    fireEvent.change(screen.getByLabelText(/estimated financial impact/i), { target: { value: "92000" } });

    await user.click(screen.getByRole("button", { name: /classify incident/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "BACS file processing exception",
        paymentType: "Faster Payments",
        affectedCustomers: 510,
        transactionCount: 2200,
        estimatedFinancialImpact: 92000,
        ownerTeam: "Back Office Operations",
      }),
    );
  });

  it("clears the form without submitting", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AddIncidentForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/incident title/i), "Temporary incident");
    await user.click(screen.getByRole("button", { name: /clear form/i }));

    expect(screen.getByLabelText(/incident title/i)).toHaveValue("");
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
