import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test/test-utils";
import NotFound from "@/pages/NotFound";

describe("NotFound Page", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders 404 message", () => {
    render(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders page not found text", () => {
    render(<NotFound />);
    expect(screen.getByText("Oops! Page not found")).toBeInTheDocument();
  });

  it("renders a link to home", () => {
    render(<NotFound />);
    const homeLink = screen.getByRole("link", { name: /Return to Home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
  });
});
