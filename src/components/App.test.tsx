import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../App";

describe("App", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the final platform shell with four main tabs", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: /fintech incident intelligence & risk operations platform/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Workbench" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Incident Tracker" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reports" })).toBeInTheDocument();
  });

  it("navigates from dashboard to the payment workbench", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Workbench" }));

    expect(screen.getByRole("heading", { name: /payment incident triage & reconciliation workbench/i })).toBeInTheDocument();
  });

  it("submits an incident, shows classification, and makes it available in the tracker", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Workbench" }));

    fireEvent.change(screen.getByLabelText(/incident title/i), { target: { value: "Treasury file variance test" } });
    fireEvent.change(screen.getByLabelText(/reported by/i), { target: { value: "Treasury Operations" } });
    fireEvent.change(screen.getByLabelText(/owner\/team/i), { target: { value: "Treasury Operations" } });
    fireEvent.change(screen.getByLabelText(/affected service/i), { target: { value: "CHAPS settlement" } });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "High value payment delay requiring payment operations triage." },
    });
    fireEvent.change(screen.getByLabelText(/estimated financial impact/i), { target: { value: "125000" } });

    await user.click(screen.getByRole("button", { name: /classify incident/i }));

    expect(await screen.findByText(/logged and classified successfully/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /FIN-0011: Treasury file variance test/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Incident Tracker" }));

    expect(screen.getAllByText("Treasury file variance test").length).toBeGreaterThan(0);
  });

  it("updates incident status locally from the tracker", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Incident Tracker" }));
    await user.selectOptions(screen.getByLabelText(/Update status for FIN-/), "Resolved");

    expect(screen.getByText(/status updated to Resolved/i)).toBeInTheDocument();
  });
});
