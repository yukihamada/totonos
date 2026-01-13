import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../test-utils";
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
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { session: null, user: null },
      error: null
    }),
    signUp: vi.fn().mockResolvedValue({
      data: { session: null, user: null },
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

  it("renders the login form by default", async () => {
    renderAuth();
    await waitFor(() => {
      expect(screen.getByText("Invox")).toBeInTheDocument();
    });
    expect(screen.getByText("次世代財務オートメーションプラットフォーム")).toBeInTheDocument();
  });

  it("renders tabs for login and signup", async () => {
    renderAuth();
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "ログイン" })).toBeInTheDocument();
    });
    expect(screen.getByRole("tab", { name: "新規登録" })).toBeInTheDocument();
  });

  it("can switch to signup tab", async () => {
    const user = userEvent.setup();
    renderAuth();

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "新規登録" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("tab", { name: "新規登録" }));
    expect(screen.getByPlaceholderText("6文字以上")).toBeInTheDocument();
  });

  it("has email and password inputs", async () => {
    renderAuth();

    await waitFor(() => {
      expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    });

    expect(screen.getByLabelText("パスワード")).toBeInTheDocument();
  });

  it("has correct input types for email and password", async () => {
    renderAuth();

    await waitFor(() => {
      expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");

    expect(emailInput).toHaveAttribute("type", "email");
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("has a login button", async () => {
    renderAuth();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "ログイン" })).toBeInTheDocument();
    });
  });

  it("allows typing in email and password fields", async () => {
    const user = userEvent.setup();
    renderAuth();

    await waitFor(() => {
      expect(screen.getByLabelText("メールアドレス")).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });
});
