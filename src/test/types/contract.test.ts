import { describe, it, expect } from "vitest";
import {
  getContractStatusColor,
  getContractStatusLabel,
} from "@/types/contract";

describe("Contract Types and Utilities", () => {
  describe("getContractStatusColor", () => {
    it("returns correct color for draft status", () => {
      expect(getContractStatusColor("draft")).toBe("bg-muted text-muted-foreground");
    });

    it("returns correct color for sent status", () => {
      expect(getContractStatusColor("sent")).toBe("bg-chart-4/20 text-chart-4");
    });

    it("returns correct color for pending_signature status", () => {
      expect(getContractStatusColor("pending_signature")).toBe("bg-chart-1/20 text-chart-1");
    });

    it("returns correct color for partially_signed status", () => {
      expect(getContractStatusColor("partially_signed")).toBe("bg-chart-3/20 text-chart-3");
    });

    it("returns correct color for signed status", () => {
      expect(getContractStatusColor("signed")).toBe("bg-chart-2/20 text-chart-2");
    });

    it("returns correct color for expired status", () => {
      expect(getContractStatusColor("expired")).toBe("bg-destructive/20 text-destructive");
    });

    it("returns correct color for cancelled status", () => {
      expect(getContractStatusColor("cancelled")).toBe("bg-muted text-muted-foreground");
    });
  });

  describe("getContractStatusLabel", () => {
    it("returns correct Japanese label for draft status", () => {
      expect(getContractStatusLabel("draft")).toBe("下書き");
    });

    it("returns correct Japanese label for sent status", () => {
      expect(getContractStatusLabel("sent")).toBe("送付済み");
    });

    it("returns correct Japanese label for pending_signature status", () => {
      expect(getContractStatusLabel("pending_signature")).toBe("署名待ち");
    });

    it("returns correct Japanese label for partially_signed status", () => {
      expect(getContractStatusLabel("partially_signed")).toBe("一部署名済み");
    });

    it("returns correct Japanese label for signed status", () => {
      expect(getContractStatusLabel("signed")).toBe("締結済み");
    });

    it("returns correct Japanese label for expired status", () => {
      expect(getContractStatusLabel("expired")).toBe("期限切れ");
    });

    it("returns correct Japanese label for cancelled status", () => {
      expect(getContractStatusLabel("cancelled")).toBe("キャンセル");
    });
  });
});
