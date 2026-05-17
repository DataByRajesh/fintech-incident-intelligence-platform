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

  it("submits an incident, shows classification, makes it available in tracker, and includes it in reports", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Workbench" }));

    fireEvent.change(screen.getByLabelText(/incident title/i), { target: { value: "Corporate CHAPS high-value payment delay" } });
    fireEvent.change(screen.getByLabelText(/payment rail\/type/i), { target: { value: "CHAPS" } });
    fireEvent.change(screen.getByLabelText(/reported by/i), { target: { value: "Treasury Operations" } });
    fireEvent.change(screen.getByLabelText(/owner\/team/i), { target: { value: "Treasury Operations" } });
    fireEvent.change(screen.getByLabelText(/affected service/i), { target: { value: "CHAPS settlement" } });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "High value payment delay requiring payment operations triage before scheme cut-off." },
    });
    fireEvent.change(screen.getByLabelText(/affected customers/i), { target: { value: "1200" } });
    fireEvent.change(screen.getByLabelText(/transaction count/i), { target: { value: "5200" } });
    fireEvent.change(screen.getByLabelText(/estimated financial impact/i), { target: { value: "999999" } });
    fireEvent.change(screen.getByLabelText(/customer impact/i), { target: { value: "Critical" } });
    fireEvent.change(screen.getByLabelText("Financial impact"), { target: { value: "Critical" } });
    fireEvent.change(screen.getByLabelText(/sla urgency/i), { target: { value: "Critical" } });
    fireEvent.change(screen.getByLabelText(/compliance sensitivity/i), { target: { value: "Critical" } });
    fireEvent.change(screen.getByLabelText(/workaround availability/i), { target: { value: "Unavailable" } });

    await user.click(screen.getByRole("button", { name: /classify incident/i }));

    expect(await screen.findByText(/logged and classified successfully/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /FIN-0011: Corporate CHAPS high-value payment delay/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Incident Tracker" }));

    expect(screen.getAllByText("Corporate CHAPS high-value payment delay").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "Reports" }));

    expect(screen.getByText(/11 demo incidents are under review/i)).toBeInTheDocument();
    expect(screen.getByText(/Corporate CHAPS high-value payment delay/i)).toBeInTheDocument();
  });

  it("updates incident status locally from the tracker", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Incident Tracker" }));
    await user.selectOptions(screen.getByLabelText(/Update status for FIN-/), "Resolved");

    expect(screen.getByText(/status updated to Resolved/i)).toBeInTheDocument();
  });
});
