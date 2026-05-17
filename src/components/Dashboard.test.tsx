import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { demoIncidents } from "../data/demoIncidents";
import { Dashboard } from "./Dashboard";

describe("Dashboard", () => {
  it("renders executive risk metrics and demo governance copy", () => {
    render(<Dashboard incidents={demoIncidents} onNavigate={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("Total incidents")).toBeInTheDocument();
    expect(screen.getByText("Critical/high incidents")).toBeInTheDocument();
    expect(screen.getByText("Reconciliation breaks")).toBeInTheDocument();
    expect(screen.getByText(/demo system only/i)).toBeInTheDocument();
  });

  it("routes workbench actions through the navigation callback", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<Dashboard incidents={demoIncidents} onNavigate={onNavigate} />);

    await user.click(screen.getByRole("button", { name: /\+ open workbench/i }));

    expect(onNavigate).toHaveBeenCalledWith("workbench");
  });
});
