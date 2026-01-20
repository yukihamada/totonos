import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SalesBarChart } from "@/components/emr/SalesBarChart";

// Mock Recharts components
vi.mock("recharts", () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

const mockData = [
  { date: "1/13", insurance_revenue: 120000, self_pay_revenue: 15000 },
  { date: "1/14", insurance_revenue: 85000, self_pay_revenue: 22000 },
  { date: "1/15", insurance_revenue: 150000, self_pay_revenue: 8000 },
  { date: "1/16", insurance_revenue: 95000, self_pay_revenue: 18000 },
  { date: "1/17", insurance_revenue: 130000, self_pay_revenue: 25000 },
];

describe("SalesBarChart", () => {
  describe("rendering", () => {
    it("should render default title", () => {
      render(<SalesBarChart data={mockData} />);
      expect(screen.getByText("売上推移")).toBeInTheDocument();
    });

    it("should render custom title", () => {
      render(<SalesBarChart data={mockData} title="週間売上グラフ" />);
      expect(screen.getByText("週間売上グラフ")).toBeInTheDocument();
    });

    it("should render bar chart container", () => {
      render(<SalesBarChart data={mockData} />);
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });

    it("should render responsive container", () => {
      render(<SalesBarChart data={mockData} />);
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("should render cartesian grid", () => {
      render(<SalesBarChart data={mockData} />);
      expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
    });

    it("should render x-axis", () => {
      render(<SalesBarChart data={mockData} />);
      expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    });

    it("should render y-axis", () => {
      render(<SalesBarChart data={mockData} />);
      expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    });

    it("should render tooltip", () => {
      render(<SalesBarChart data={mockData} />);
      expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    });

    it("should render legend", () => {
      render(<SalesBarChart data={mockData} />);
      expect(screen.getByTestId("legend")).toBeInTheDocument();
    });

    it("should render with empty data", () => {
      render(<SalesBarChart data={[]} />);
      expect(screen.getByText("売上推移")).toBeInTheDocument();
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });
  });
});
