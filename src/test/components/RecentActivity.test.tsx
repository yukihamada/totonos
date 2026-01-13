import { describe, it, expect } from "vitest";
import { render, screen } from "../test-utils";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

const mockActivities = [
  { id: "1", type: "payment" as const, title: "株式会社ABC", amount: 550000, date: "2026-01-13" },
  { id: "2", type: "invoice" as const, title: "請求書 #INV202601-0003", amount: 1200000, status: "sent" as const, date: "2026-01-12" },
  { id: "3", type: "boost" as const, title: "Boost完了", amount: 800000, date: "2026-01-10" },
];

describe("RecentActivity", () => {
  it("renders the title", () => {
    render(<RecentActivity activities={mockActivities} />);
    expect(screen.getByText("最近のアクティビティ")).toBeInTheDocument();
  });

  it("renders all activities", () => {
    render(<RecentActivity activities={mockActivities} />);
    expect(screen.getByText("株式会社ABC")).toBeInTheDocument();
    expect(screen.getByText("請求書 #INV202601-0003")).toBeInTheDocument();
    expect(screen.getByText("Boost完了")).toBeInTheDocument();
  });

  it("renders activity dates", () => {
    render(<RecentActivity activities={mockActivities} />);
    expect(screen.getByText("2026-01-13")).toBeInTheDocument();
    expect(screen.getByText("2026-01-12")).toBeInTheDocument();
    expect(screen.getByText("2026-01-10")).toBeInTheDocument();
  });

  it("renders formatted amounts containing correct numbers", () => {
    render(<RecentActivity activities={mockActivities} />);
    // Check for amounts with flexible format matching
    expect(screen.getByText(/550,000/)).toBeInTheDocument();
    expect(screen.getByText(/1,200,000/)).toBeInTheDocument();
    expect(screen.getByText(/800,000/)).toBeInTheDocument();
  });

  it("renders empty message when no activities", () => {
    render(<RecentActivity activities={[]} />);
    expect(screen.getByText("アクティビティはありません")).toBeInTheDocument();
  });

  it("renders status badge for invoice with status", () => {
    render(<RecentActivity activities={mockActivities} />);
    // The status label for 'sent' is '送付済み'
    expect(screen.getByText("送付済み")).toBeInTheDocument();
  });
});
