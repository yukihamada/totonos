import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TrustPassportMini } from "@/components/dashboard/TrustPassportMini";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { formatCurrency } from "@/types/database";
import { Wallet, FileText, Clock, Zap } from "lucide-react";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
  },
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const demoActivities = [
  { id: "1", type: "payment" as const, title: "株式会社ABC", amount: 550000, date: "2026-01-13" },
  { id: "2", type: "invoice" as const, title: "請求書 #INV202601-0003", amount: 1200000, status: "sent" as const, date: "2026-01-12" },
  { id: "3", type: "boost" as const, title: "Boost完了", amount: 800000, date: "2026-01-10" },
];

describe("Dashboard Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders StatsCard with correct values", () => {
    render(
      <TestWrapper>
        <StatsCard
          title="利用可能キャッシュ"
          value={formatCurrency(5250000)}
          description="手元資金 + 請求済み未入金"
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: "12%", positive: true }}
        />
      </TestWrapper>
    );
    expect(screen.getByText("利用可能キャッシュ")).toBeInTheDocument();
    expect(screen.getByText(/5,250,000/)).toBeInTheDocument();
    expect(screen.getByText("+12%")).toBeInTheDocument();
  });

  it("renders all stats cards", () => {
    render(
      <TestWrapper>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="利用可能キャッシュ"
            value={formatCurrency(5250000)}
            icon={<Wallet className="h-4 w-4" />}
          />
          <StatsCard
            title="今月の請求額"
            value={formatCurrency(3800000)}
            icon={<FileText className="h-4 w-4" />}
          />
          <StatsCard
            title="入金待ち"
            value={formatCurrency(2100000)}
            icon={<Clock className="h-4 w-4" />}
          />
          <StatsCard
            title="Boost可能額"
            value={formatCurrency(1800000)}
            icon={<Zap className="h-4 w-4" />}
          />
        </div>
      </TestWrapper>
    );
    expect(screen.getByText("利用可能キャッシュ")).toBeInTheDocument();
    expect(screen.getByText("今月の請求額")).toBeInTheDocument();
    expect(screen.getByText("入金待ち")).toBeInTheDocument();
    expect(screen.getByText("Boost可能額")).toBeInTheDocument();
  });

  it("renders TrustPassportMini section", () => {
    render(
      <TestWrapper>
        <TrustPassportMini score={782} rank="A" previousScore={759} />
      </TestWrapper>
    );
    expect(screen.getByText("Trust Passport")).toBeInTheDocument();
    expect(screen.getByText("782 / 1000")).toBeInTheDocument();
  });

  it("renders RecentActivity section", () => {
    render(
      <TestWrapper>
        <RecentActivity activities={demoActivities} />
      </TestWrapper>
    );
    expect(screen.getByText("最近のアクティビティ")).toBeInTheDocument();
    expect(screen.getByText("株式会社ABC")).toBeInTheDocument();
    expect(screen.getByText("請求書 #INV202601-0003")).toBeInTheDocument();
    expect(screen.getByText("Boost完了")).toBeInTheDocument();
  });

  it("displays formatted currency values", () => {
    render(
      <TestWrapper>
        <RecentActivity activities={demoActivities} />
      </TestWrapper>
    );
    expect(screen.getByText(/550,000/)).toBeInTheDocument();
    expect(screen.getByText(/1,200,000/)).toBeInTheDocument();
    expect(screen.getByText(/800,000/)).toBeInTheDocument();
  });
});
