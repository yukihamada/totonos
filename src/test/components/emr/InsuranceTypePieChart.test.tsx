import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  InsuranceTypePieChart,
  getInsuranceTypeLabel,
  getInsuranceTypeColor,
} from "@/components/emr/InsuranceTypePieChart";
import type { InsuranceTypeSummary } from "@/types/emr";

// Mock Recharts components
vi.mock("recharts", () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie">{children}</div>
  ),
  Cell: () => <div data-testid="cell" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Legend: () => <div data-testid="legend" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

const mockData: InsuranceTypeSummary[] = [
  { type: "employee_health", count: 10, amount: 150000 },
  { type: "national_health", count: 8, amount: 120000 },
  { type: "late_elderly", count: 5, amount: 80000 },
  { type: "welfare", count: 2, amount: 30000 },
  { type: "self_pay", count: 3, amount: 25000 },
];

describe("InsuranceTypePieChart", () => {
  describe("rendering", () => {
    it("should render default title", () => {
      render(<InsuranceTypePieChart data={mockData} />);
      expect(screen.getByText("保険種別分布")).toBeInTheDocument();
    });

    it("should render custom title", () => {
      render(<InsuranceTypePieChart data={mockData} title="カスタムタイトル" />);
      expect(screen.getByText("カスタムタイトル")).toBeInTheDocument();
    });

    it("should render pie chart container", () => {
      render(<InsuranceTypePieChart data={mockData} />);
      expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
    });

    it("should render responsive container", () => {
      render(<InsuranceTypePieChart data={mockData} />);
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("should render legend", () => {
      render(<InsuranceTypePieChart data={mockData} />);
      expect(screen.getByTestId("legend")).toBeInTheDocument();
    });

    it("should render tooltip", () => {
      render(<InsuranceTypePieChart data={mockData} />);
      expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    });

    it("should render with empty data", () => {
      render(<InsuranceTypePieChart data={[]} />);
      expect(screen.getByText("保険種別分布")).toBeInTheDocument();
    });
  });

  describe("getInsuranceTypeLabel", () => {
    it("should return correct label for employee_health", () => {
      expect(getInsuranceTypeLabel("employee_health")).toBe("社保");
    });

    it("should return correct label for national_health", () => {
      expect(getInsuranceTypeLabel("national_health")).toBe("国保");
    });

    it("should return correct label for late_elderly", () => {
      expect(getInsuranceTypeLabel("late_elderly")).toBe("後期");
    });

    it("should return correct label for welfare", () => {
      expect(getInsuranceTypeLabel("welfare")).toBe("生保");
    });

    it("should return correct label for self_pay", () => {
      expect(getInsuranceTypeLabel("self_pay")).toBe("自費");
    });
  });

  describe("getInsuranceTypeColor", () => {
    it("should return a color string for employee_health", () => {
      const color = getInsuranceTypeColor("employee_health");
      expect(color).toMatch(/^hsl\(/);
    });

    it("should return a color string for national_health", () => {
      const color = getInsuranceTypeColor("national_health");
      expect(color).toMatch(/^hsl\(/);
    });

    it("should return a color string for late_elderly", () => {
      const color = getInsuranceTypeColor("late_elderly");
      expect(color).toMatch(/^hsl\(/);
    });

    it("should return a color string for welfare", () => {
      const color = getInsuranceTypeColor("welfare");
      expect(color).toMatch(/^hsl\(/);
    });

    it("should return a color string for self_pay", () => {
      const color = getInsuranceTypeColor("self_pay");
      expect(color).toMatch(/^hsl\(/);
    });
  });
});
