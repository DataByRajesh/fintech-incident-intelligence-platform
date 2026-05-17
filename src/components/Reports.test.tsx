import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { demoIncidents } from "../data/demoIncidents";
import { Reports } from "./Reports";

describe("Reports", () => {
  it("renders structured management report headings", () => {
    render(<Reports incidents={demoIncidents} />);

    expect(screen.getByRole("heading", { name: "Reports" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Operational summary" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Severity breakdown" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Reconciliation summary" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Customer impact summary" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Financial exposure" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Management update" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Next steps" })).toBeInTheDocument();
  });
});
