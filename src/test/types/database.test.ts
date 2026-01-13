import { describe, it, expect } from "vitest";
import {
  getRankFromScore,
  getRankColor,
  getStatusColor,
  getStatusLabel,
  formatCurrency,
} from "@/types/database";

describe("Database utility functions", () => {
  describe("getRankFromScore", () => {
    it("returns S for score >= 900", () => {
      expect(getRankFromScore(900)).toBe("S");
      expect(getRankFromScore(950)).toBe("S");
      expect(getRankFromScore(1000)).toBe("S");
    });

    it("returns A for score >= 700 and < 900", () => {
      expect(getRankFromScore(700)).toBe("A");
      expect(getRankFromScore(850)).toBe("A");
      expect(getRankFromScore(899)).toBe("A");
    });

    it("returns B for score >= 500 and < 700", () => {
      expect(getRankFromScore(500)).toBe("B");
      expect(getRankFromScore(600)).toBe("B");
      expect(getRankFromScore(699)).toBe("B");
    });

    it("returns C for score >= 300 and < 500", () => {
      expect(getRankFromScore(300)).toBe("C");
      expect(getRankFromScore(400)).toBe("C");
      expect(getRankFromScore(499)).toBe("C");
    });

    it("returns D for score < 300", () => {
      expect(getRankFromScore(0)).toBe("D");
      expect(getRankFromScore(100)).toBe("D");
      expect(getRankFromScore(299)).toBe("D");
    });
  });

  describe("getRankColor", () => {
    it("returns correct color for each rank", () => {
      expect(getRankColor("S")).toBe("text-chart-2");
      expect(getRankColor("A")).toBe("text-chart-1");
      expect(getRankColor("B")).toBe("text-chart-4");
      expect(getRankColor("C")).toBe("text-muted-foreground");
      expect(getRankColor("D")).toBe("text-destructive");
    });
  });

  describe("getStatusColor", () => {
    it("returns correct color for each status", () => {
      expect(getStatusColor("draft")).toBe("bg-muted text-muted-foreground");
      expect(getStatusColor("sent")).toBe("bg-chart-4/20 text-chart-4");
      expect(getStatusColor("pending")).toBe("bg-chart-1/20 text-chart-1");
      expect(getStatusColor("paid")).toBe("bg-chart-2/20 text-chart-2");
      expect(getStatusColor("overdue")).toBe("bg-destructive/20 text-destructive");
      expect(getStatusColor("cancelled")).toBe("bg-muted text-muted-foreground");
    });
  });

  describe("getStatusLabel", () => {
    it("returns correct Japanese label for each status", () => {
      expect(getStatusLabel("draft")).toBe("下書き");
      expect(getStatusLabel("sent")).toBe("送付済み");
      expect(getStatusLabel("pending")).toBe("入金待ち");
      expect(getStatusLabel("paid")).toBe("入金済み");
      expect(getStatusLabel("overdue")).toBe("遅延");
      expect(getStatusLabel("cancelled")).toBe("キャンセル");
    });
  });

  describe("formatCurrency", () => {
    it("formats number as Japanese yen with currency symbol", () => {
      const result1000 = formatCurrency(1000);
      expect(result1000).toContain("1,000");

      const result1M = formatCurrency(1000000);
      expect(result1M).toContain("1,000,000");

      const result0 = formatCurrency(0);
      expect(result0).toContain("0");
    });

    it("formats large numbers correctly", () => {
      const result = formatCurrency(12345678);
      expect(result).toContain("12,345,678");
    });

    it("handles decimal numbers by rounding", () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain("1,23");
    });
  });
});
