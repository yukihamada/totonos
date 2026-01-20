import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KpiCard } from "@/components/emr/KpiCard";
import { TrendingUp } from "lucide-react";

describe("KpiCard", () => {
  describe("rendering", () => {
    it("should render title and value", () => {
      render(<KpiCard title="売上" value="¥100,000" />);
      expect(screen.getByText("売上")).toBeInTheDocument();
      expect(screen.getByText("¥100,000")).toBeInTheDocument();
    });

    it("should render numeric value", () => {
      render(<KpiCard title="患者数" value={24} />);
      expect(screen.getByText("患者数")).toBeInTheDocument();
      expect(screen.getByText("24")).toBeInTheDocument();
    });

    it("should render subtitle when provided", () => {
      render(<KpiCard title="売上" value="¥100,000" subtitle="本日の売上" />);
      expect(screen.getByText("本日の売上")).toBeInTheDocument();
    });

    it("should render icon when provided", () => {
      const { container } = render(
        <KpiCard title="売上" value="¥100,000" icon={TrendingUp} />
      );
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should render positive trend correctly", () => {
      render(
        <KpiCard
          title="売上"
          value="¥100,000"
          trend={{ value: 12, isPositive: true }}
        />
      );
      expect(screen.getByText("+12%")).toBeInTheDocument();
    });

    it("should render negative trend correctly", () => {
      render(
        <KpiCard
          title="売上"
          value="¥100,000"
          trend={{ value: -5, isPositive: false }}
        />
      );
      expect(screen.getByText("-5%")).toBeInTheDocument();
    });

    it("should apply highlight variant styles", () => {
      const { container } = render(
        <KpiCard title="重要KPI" value="85%" variant="highlight" />
      );
      // Check that highlight classes are applied
      const card = container.firstChild;
      expect(card).toHaveClass("border-primary/50");
      expect(card).toHaveClass("bg-primary/5");
    });

    it("should apply default variant without highlight styles", () => {
      const { container } = render(
        <KpiCard title="通常KPI" value="50%" variant="default" />
      );
      const card = container.firstChild;
      expect(card).not.toHaveClass("border-primary/50");
    });

    it("should apply custom icon color", () => {
      const { container } = render(
        <KpiCard
          title="売上"
          value="¥100,000"
          icon={TrendingUp}
          iconColor="text-green-600"
        />
      );
      const iconContainer = container.querySelector(".text-green-600");
      expect(iconContainer).toBeInTheDocument();
    });
  });
});
