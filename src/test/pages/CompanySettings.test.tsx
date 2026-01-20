import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test/test-utils";
import CompanySettings from "@/pages/CompanySettings";

// Mock hooks
vi.mock("@/hooks/useCompany", () => ({
  useCurrentCompany: () => ({
    data: {
      id: "test-company-id",
      name: "テスト株式会社",
      display_name: "テスト社",
      email: "test@example.com",
      phone: "03-1234-5678",
      address: "東京都渋谷区",
      invoice_registration_number: "T1234567890123",
    },
    isLoading: false,
  }),
  useUserCompanies: () => ({
    data: [
      {
        company_id: "test-company-id",
        role: "owner",
        companies: {
          name: "テスト株式会社",
          display_name: "テスト社",
        },
      },
    ],
  }),
  useCreateCompany: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateCompany: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useSwitchCompany: () => ({ mutate: vi.fn(), isPending: false }),
  useCompanyMembers: () => ({ data: [] }),
  useCompanyInvitations: () => ({ data: [] }),
  useCreateInvitation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateMemberRole: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRemoveMember: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCancelInvitation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateMemberPermissions: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteCompany: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("@/hooks/useCreditsV2", () => ({
  useHybridCredits: () => ({
    companyRemaining: 100,
    userRemaining: 50,
    totalRemaining: 150,
  }),
  PLANS: {
    free: { monthly: 100, label: "Free" },
    starter: { monthly: 500, label: "Starter" },
    standard: { monthly: 2000, label: "Standard" },
    pro: { monthly: 5000, label: "Pro" },
    enterprise: { monthly: -1, label: "Enterprise" },
  },
  CHARGE_PACKS: [],
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe("CompanySettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders company settings page", () => {
    render(<CompanySettings />);
    expect(screen.getByText("会社・チーム管理")).toBeInTheDocument();
  });

  it("displays company information tab by default", () => {
    render(<CompanySettings />);
    expect(screen.getByText("会社情報")).toBeInTheDocument();
  });

  it("shows invoice registration number field", async () => {
    render(<CompanySettings />);
    
    // Check for the label
    const invoiceLabel = screen.getByText("インボイス登録番号");
    expect(invoiceLabel).toBeInTheDocument();
    
    // Check for the placeholder
    const invoiceInput = screen.getByPlaceholderText("T1234567890123");
    expect(invoiceInput).toBeInTheDocument();
  });

  it("displays helper text for invoice registration number", () => {
    render(<CompanySettings />);
    expect(
      screen.getByText(/適格請求書発行事業者の登録番号/)
    ).toBeInTheDocument();
  });

  it("shows current company switcher", () => {
    render(<CompanySettings />);
    expect(screen.getByText("現在の会社")).toBeInTheDocument();
  });

  it("displays all tab options", () => {
    render(<CompanySettings />);
    expect(screen.getByText("会社情報")).toBeInTheDocument();
    expect(screen.getByText("メンバー")).toBeInTheDocument();
    expect(screen.getByText("招待")).toBeInTheDocument();
    expect(screen.getByText("メール")).toBeInTheDocument();
    expect(screen.getByText("クレジット")).toBeInTheDocument();
    expect(screen.getByText("セキュリティ")).toBeInTheDocument();
  });
});
