import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import Auth from "@/pages/Auth";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";

// Create fresh mocks for each test
const createMockSupabase = () => ({
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    onAuthStateChange: vi.fn((callback: (event: string, session: unknown) => void) => {
      setTimeout(() => callback("INITIAL_SESSION", null), 0);
      return {
        data: { subscription: { unsubscribe: vi.fn() } },
      };
    }),
    signInWithOtp: vi.fn().mockResolvedValue({
      data: {},
      error: null
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
});

let mockSupabase = createMockSupabase();

vi.mock("@/integrations/supabase/client", () => ({
  get supabase() {
    return mockSupabase;
  },
}));

const renderAuth = () => {
  return render(
    <AuthProvider>
      <Auth />
      <Toaster />
    </AuthProvider>
  );
};

describe("Auth Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = createMockSupabase();
  });

  it("renders the login form with Totonos branding", async () => {
    renderAuth();
    await waitFor(() => {
      expect(screen.getByText("Totonos")).toBeInTheDocument();
    });
    expect(screen.getByText("メールアドレスを入力してログイン・登録")).toBeInTheDocument();
  });

  it("renders email input field", async () => {
    renderAuth();
    await waitFor(() => {
      expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    });
  });

  it("renders submit button", async () => {
    renderAuth();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /ログインリンクを送信/i })).toBeInTheDocument();
    });
  });

  it("has correct input type for email", async () => {
    renderAuth();
    await waitFor(() => {
      expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText("メールアドレス");
    expect(emailInput).toHaveAttribute("type", "email");
  });

  it("allows typing in email field", async () => {
    const user = userEvent.setup();
    renderAuth();

    await waitFor(() => {
      expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText("メールアドレス");
    await user.type(emailInput, "test@example.com");

    expect(emailInput).toHaveValue("test@example.com");
  });

  it("displays info text about passwordless login", async () => {
    renderAuth();
    await waitFor(() => {
      expect(screen.getByText(/パスワードは不要です/i)).toBeInTheDocument();
    });
  });

  it("shows email sent confirmation after successful submission", async () => {
    const user = userEvent.setup();
    renderAuth();

    await waitFor(() => {
      expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText("メールアドレス");
    const submitButton = screen.getByRole("button", { name: /ログインリンクを送信/i });

    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("メールを確認してください")).toBeInTheDocument();
    });
  });
});
