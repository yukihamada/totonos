import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/test-utils";
import Leads from "@/pages/Leads";

// Mock useAuth
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "test-user-id" },
    session: {},
    loading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock useCRM hooks
const mockLeads = [
  {
    id: "1",
    company_name: "株式会社ABC",
    contact_name: "田中太郎",
    email: "tanaka@abc.com",
    phone: "03-1234-5678",
    source: "website",
    status: "new",
    created_at: "2024-01-15T10:00:00Z",
    notes: "",
  },
  {
    id: "2",
    company_name: "XYZ株式会社",
    contact_name: "鈴木花子",
    email: "suzuki@xyz.com",
    phone: "03-8765-4321",
    source: "referral",
    status: "contacted",
    created_at: "2024-01-20T14:00:00Z",
    notes: "",
  },
];

vi.mock("@/hooks/useCRM", () => ({
  useLeads: vi.fn(() => ({
    data: mockLeads,
    isLoading: false,
  })),
  useCreateLead: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useDeleteLead: vi.fn(() => ({
    mutate: vi.fn(),
  })),
  useUpdateLead: vi.fn(() => ({
    mutate: vi.fn(),
  })),
}));

describe("Leads Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page title", async () => {
    render(<Leads />);
    await waitFor(() => {
      expect(screen.getByText("リード管理")).toBeInTheDocument();
    });
  });

  it("renders the page description", async () => {
    render(<Leads />);
    await waitFor(() => {
      expect(screen.getByText("見込み客の管理")).toBeInTheDocument();
    });
  });

  it("renders the add lead button", async () => {
    render(<Leads />);
    await waitFor(() => {
      expect(screen.getByText("リードを追加")).toBeInTheDocument();
    });
  });

  it("renders search input", async () => {
    render(<Leads />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText("検索...")).toBeInTheDocument();
    });
  });

  it("renders table headers", async () => {
    render(<Leads />);
    await waitFor(() => {
      expect(screen.getByText("会社名")).toBeInTheDocument();
      expect(screen.getByText("担当者")).toBeInTheDocument();
      expect(screen.getByText("流入元")).toBeInTheDocument();
      expect(screen.getByText("ステータス")).toBeInTheDocument();
      expect(screen.getByText("登録日")).toBeInTheDocument();
    });
  });

  it("renders lead data in table", async () => {
    render(<Leads />);
    await waitFor(() => {
      expect(screen.getByText("株式会社ABC")).toBeInTheDocument();
      expect(screen.getByText("田中太郎")).toBeInTheDocument();
    });
  });

  it("renders multiple leads", async () => {
    render(<Leads />);
    await waitFor(() => {
      expect(screen.getByText("XYZ株式会社")).toBeInTheDocument();
      expect(screen.getByText("鈴木花子")).toBeInTheDocument();
    });
  });
});
