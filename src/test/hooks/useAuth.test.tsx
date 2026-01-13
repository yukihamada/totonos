import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ReactNode } from "react";

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

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("useAuth Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = createMockSupabase();
  });

  it("throws error when used outside AuthProvider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth must be used within an AuthProvider");

    consoleSpy.mockRestore();
  });

  it("initially has loading state", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    // Loading should eventually become false
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("sets user to null when no session", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBe(null);
    expect(result.current.session).toBe(null);
  });

  it("provides signIn function", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.signIn).toBeDefined();
    expect(typeof result.current.signIn).toBe("function");
  });

  it("provides signUp function", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.signUp).toBeDefined();
    expect(typeof result.current.signUp).toBe("function");
  });

  it("provides signOut function", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.signOut).toBeDefined();
    expect(typeof result.current.signOut).toBe("function");
  });

  it("calls supabase signIn when signIn is called", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.signIn("test@example.com", "password123");
    });

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("calls supabase signOut when signOut is called", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });
});
