import { render, screen } from "@testing-library/react";
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
});
