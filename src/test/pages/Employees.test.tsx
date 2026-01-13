import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../test-utils";
import Employees from "@/pages/Employees";

// Mock useAuth
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "test-user-id" },
    session: {},
    loading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock useHR hooks
const mockEmployees = [
  {
    id: "1",
    employee_number: "EMP-001",
    name: "山田太郎",
    email: "yamada@company.com",
    department: "営業部",
    position: "部長",
    hire_date: "2020-04-01",
    employment_type: "full_time",
    status: "active",
  },
  {
    id: "2",
    employee_number: "EMP-002",
    name: "佐藤花子",
    email: "sato@company.com",
    department: "開発部",
    position: "エンジニア",
    hire_date: "2022-07-15",
    employment_type: "full_time",
    status: "active",
  },
];

vi.mock("@/hooks/useHR", () => ({
  useEmployees: vi.fn(() => ({
    data: mockEmployees,
    isLoading: false,
  })),
  useCreateEmployee: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useDeleteEmployee: vi.fn(() => ({
    mutate: vi.fn(),
  })),
}));

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}));

describe("Employees Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page title", async () => {
    render(<Employees />);
    await waitFor(() => {
      expect(screen.getByText("従業員管理")).toBeInTheDocument();
    });
  });

  it("renders the page description", async () => {
    render(<Employees />);
    await waitFor(() => {
      expect(screen.getByText("従業員情報の管理")).toBeInTheDocument();
    });
  });

  it("renders the add employee button", async () => {
    render(<Employees />);
    await waitFor(() => {
      expect(screen.getByText("従業員を追加")).toBeInTheDocument();
    });
  });

  it("renders search input", async () => {
    render(<Employees />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText("検索...")).toBeInTheDocument();
    });
  });

  it("renders table headers", async () => {
    render(<Employees />);
    await waitFor(() => {
      expect(screen.getByText("社員番号")).toBeInTheDocument();
      expect(screen.getByText("氏名")).toBeInTheDocument();
      expect(screen.getByText("部署")).toBeInTheDocument();
      expect(screen.getByText("役職")).toBeInTheDocument();
      expect(screen.getByText("雇用形態")).toBeInTheDocument();
      expect(screen.getByText("入社日")).toBeInTheDocument();
    });
  });

  it("renders employee data in table", async () => {
    render(<Employees />);
    await waitFor(() => {
      expect(screen.getByText("EMP-001")).toBeInTheDocument();
      expect(screen.getByText("山田太郎")).toBeInTheDocument();
      expect(screen.getByText("営業部")).toBeInTheDocument();
    });
  });

  it("renders multiple employees", async () => {
    render(<Employees />);
    await waitFor(() => {
      expect(screen.getByText("EMP-002")).toBeInTheDocument();
      expect(screen.getByText("佐藤花子")).toBeInTheDocument();
      expect(screen.getByText("開発部")).toBeInTheDocument();
    });
  });

  it("renders employment type badges", async () => {
    render(<Employees />);
    await waitFor(() => {
      expect(screen.getAllByText("正社員")).toHaveLength(2);
    });
  });
});
