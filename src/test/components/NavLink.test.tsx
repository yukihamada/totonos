import { describe, it, expect } from "vitest";
import { render, screen } from "../test-utils";
import { NavLink } from "@/components/NavLink";

describe("NavLink", () => {
  it("renders the link with correct text", () => {
    render(<NavLink to="/dashboard">Dashboard</NavLink>);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders the link with correct href", () => {
    render(<NavLink to="/dashboard">Dashboard</NavLink>);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/dashboard");
  });

  it("applies custom className", () => {
    const { container } = render(
      <NavLink to="/dashboard" className="custom-class">Dashboard</NavLink>
    );
    const link = container.querySelector("a");
    expect(link?.className).toContain("custom-class");
  });

  it("renders children content", () => {
    render(
      <NavLink to="/test">
        <span data-testid="child-element">Child Content</span>
      </NavLink>
    );
    expect(screen.getByTestId("child-element")).toBeInTheDocument();
  });
});
