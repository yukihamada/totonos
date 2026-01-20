import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test/test-utils";
import Invoices from "@/pages/Invoices";

// Mock hooks
vi.mock("@/hooks/useInvoices", () => ({
  useInvoices: () => ({
    data: [
      {
        id: "invoice-1",
        invoice_number: "INV-001",
        title: "テスト請求書",
        client: { name: "テスト取引先" },
        total_amount: 110000,
        issue_date: "2026-01-15",
        due_date: "2026-02-15",
        status: "pending",
      },
    ],
    isLoading: false,
  }),
  useCreateInvoice: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateInvoiceStatus: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteInvoice: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("@/hooks/useClients", () => ({
  useClients: () => ({
    data: [
      { id: "client-1", name: "テスト取引先" },
    ],
  }),
}));

vi.mock("@/hooks/useEmailSending", () => ({
  useSendEmail: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("@/hooks/useStripePayment", () => ({
  useCreatePaymentSession: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

describe("Invoices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders invoices page", () => {
    render(<Invoices />);
    expect(screen.getByText("請求書")).toBeInTheDocument();
    expect(screen.getByText("請求書の作成と管理")).toBeInTheDocument();
  });

  it("displays invoice list", () => {
    render(<Invoices />);
    expect(screen.getByText("INV-001")).toBeInTheDocument();
    expect(screen.getByText("テスト請求書")).toBeInTheDocument();
  });

  it("shows statistics cards", () => {
    render(<Invoices />);
    expect(screen.getByText("未払い")).toBeInTheDocument();
    expect(screen.getByText("今月入金済")).toBeInTheDocument();
    expect(screen.getByText("延滞中")).toBeInTheDocument();
    expect(screen.getByText("請求書数")).toBeInTheDocument();
  });

  it("has new invoice button", () => {
    render(<Invoices />);
    expect(screen.getByRole("button", { name: /新規作成/ })).toBeInTheDocument();
  });

  it("displays invoice table headers", () => {
    render(<Invoices />);
    expect(screen.getByText("請求書番号")).toBeInTheDocument();
    expect(screen.getByText("件名")).toBeInTheDocument();
    expect(screen.getByText("取引先")).toBeInTheDocument();
    expect(screen.getByText("金額")).toBeInTheDocument();
  });
});
