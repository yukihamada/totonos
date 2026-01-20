import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock credit hooks
const mockCanUse = vi.fn();
const mockMutateAsync = vi.fn();

vi.mock("@/hooks/useCreditsV2", () => ({
  useHybridCredits: () => ({
    totalRemaining: 100,
    canUse: mockCanUse,
  }),
  useConsumeCredits: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
  CREDIT_COSTS: {
    export: { cost: 2, description: "データエクスポート" },
  },
}));

// Mock export utils
vi.mock("@/utils/export", () => ({
  exportToCsv: vi.fn(),
  exportToJson: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockCanUse.mockReturnValue(true);
  mockMutateAsync.mockResolvedValue(true);
});

describe("useExportWithCredits", () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  describe("exportCsv function", () => {
    it("should export CSV and consume credits", async () => {
      const { useExportWithCredits } = await import("@/hooks/useExportWithCredits");
      const { result } = renderHook(() => useExportWithCredits(), {
        wrapper: createWrapper(),
      });

      const testData = [
        { id: 1, name: "Test 1" },
        { id: 2, name: "Test 2" },
      ];
      const columns = [
        { key: "id" as const, header: "ID" },
        { key: "name" as const, header: "Name" },
      ];

      await act(async () => {
        await result.current.exportCsv(testData, columns, "test");
      });

      expect(mockCanUse).toHaveBeenCalledWith("export");
      expect(mockMutateAsync).toHaveBeenCalledWith({
        action: "export",
        description: expect.stringContaining("test"),
      });
    });

    it("should not consume credits when canUse returns false", async () => {
      mockCanUse.mockReturnValue(false);

      const { useExportWithCredits } = await import("@/hooks/useExportWithCredits");
      const { result } = renderHook(() => useExportWithCredits(), {
        wrapper: createWrapper(),
      });

      const testData = [{ id: 1, name: "Test" }];
      const columns = [{ key: "id" as const, header: "ID" }];

      let exportResult: boolean | undefined;
      await act(async () => {
        exportResult = await result.current.exportCsv(testData, columns, "test");
      });

      expect(exportResult).toBe(false);
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });
  });

  describe("exportJson function", () => {
    it("should export JSON and consume credits", async () => {
      const { useExportWithCredits } = await import("@/hooks/useExportWithCredits");
      const { result } = renderHook(() => useExportWithCredits(), {
        wrapper: createWrapper(),
      });

      const testData = [
        { id: 1, name: "Test 1" },
        { id: 2, name: "Test 2" },
      ];

      await act(async () => {
        await result.current.exportJson(testData, "test");
      });

      expect(mockCanUse).toHaveBeenCalledWith("export");
      expect(mockMutateAsync).toHaveBeenCalled();
    });
  });

  describe("final export before cancellation", () => {
    it("should not consume credits for final export", async () => {
      const { useExportWithCredits } = await import("@/hooks/useExportWithCredits");
      const { result } = renderHook(
        () => useExportWithCredits({ isFinalExportBeforeCancellation: true }),
        { wrapper: createWrapper() }
      );

      const testData = [{ id: 1, name: "Test" }];
      const columns = [{ key: "id" as const, header: "ID" }];

      await act(async () => {
        await result.current.exportCsv(testData, columns, "final");
      });

      // Credits should NOT be consumed for final export
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it("should allow export even with no credits for final export", async () => {
      mockCanUse.mockReturnValue(false);

      const { useExportWithCredits } = await import("@/hooks/useExportWithCredits");
      const { result } = renderHook(
        () => useExportWithCredits({ isFinalExportBeforeCancellation: true }),
        { wrapper: createWrapper() }
      );

      // canExport should be true for final export
      expect(result.current.canExport).toBe(true);
    });
  });

  describe("canExport flag", () => {
    it("should return true when credits are available", async () => {
      mockCanUse.mockReturnValue(true);

      const { useExportWithCredits } = await import("@/hooks/useExportWithCredits");
      const { result } = renderHook(() => useExportWithCredits(), {
        wrapper: createWrapper(),
      });

      expect(result.current.canExport).toBe(true);
    });

    it("should return false when credits are insufficient", async () => {
      mockCanUse.mockReturnValue(false);

      const { useExportWithCredits } = await import("@/hooks/useExportWithCredits");
      const { result } = renderHook(() => useExportWithCredits(), {
        wrapper: createWrapper(),
      });

      expect(result.current.canExport).toBe(false);
    });
  });

  describe("exportCost", () => {
    it("should return correct export cost", async () => {
      const { useExportWithCredits } = await import("@/hooks/useExportWithCredits");
      const { result } = renderHook(() => useExportWithCredits(), {
        wrapper: createWrapper(),
      });

      expect(result.current.exportCost).toBe(2);
    });
  });
});
