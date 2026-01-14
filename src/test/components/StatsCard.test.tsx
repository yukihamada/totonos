import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Wallet } from "lucide-react";

describe("StatsCard", () => {
  it("renders title and value", () => {
    render(<StatsCard title="Test Title" value="¥1,000,000" />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("¥1,000,000")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <StatsCard
        title="Test Title"
        value="¥1,000,000"
        description="Test description"
      />
    );
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(
      <StatsCard
        title="Test Title"
        value="¥1,000,000"
        icon={<Wallet data-testid="wallet-icon" />}
      />
    );
    expect(screen.getByTestId("wallet-icon")).toBeInTheDocument();
  });

  it("renders positive trend correctly", () => {
    render(
      <StatsCard
        title="Test Title"
        value="¥1,000,000"
        trend={{ value: "12%", positive: true }}
      />
    );
    expect(screen.getByText("+12%")).toBeInTheDocument();
  });

  it("renders negative trend correctly", () => {
    render(
      <StatsCard
        title="Test Title"
        value="¥1,000,000"
        trend={{ value: "5%", positive: false }}
      />
    );
    expect(screen.getByText("5%")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <StatsCard
        title="Test Title"
        value="¥1,000,000"
        className="custom-class"
      />
    );
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });
});
