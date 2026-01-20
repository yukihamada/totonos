import { describe, it, expect } from "vitest";
import {
  validateInvoiceRegistrationNumber,
  normalizeInvoiceRegistrationNumber,
  formatInvoiceRegistrationNumber,
} from "@/lib/invoice-validation";

describe("invoice-validation", () => {
  describe("validateInvoiceRegistrationNumber", () => {
    it("should accept empty value", () => {
      const result = validateInvoiceRegistrationNumber("");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should accept valid invoice registration number", () => {
      const result = validateInvoiceRegistrationNumber("T1234567890123");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should accept lowercase t", () => {
      const result = validateInvoiceRegistrationNumber("t1234567890123");
      expect(result.isValid).toBe(true);
    });

    it("should reject number without T prefix", () => {
      const result = validateInvoiceRegistrationNumber("1234567890123");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("「T」で始まる");
    });

    it("should reject wrong length", () => {
      const result = validateInvoiceRegistrationNumber("T123456789");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("13桁");
    });

    it("should reject too long number", () => {
      const result = validateInvoiceRegistrationNumber("T12345678901234");
      expect(result.isValid).toBe(false);
    });

    it("should reject non-numeric characters after T", () => {
      const result = validateInvoiceRegistrationNumber("T123456789012A");
      expect(result.isValid).toBe(false);
    });

    it("should handle whitespace", () => {
      const result = validateInvoiceRegistrationNumber("  T1234567890123  ");
      expect(result.isValid).toBe(true);
    });
  });

  describe("normalizeInvoiceRegistrationNumber", () => {
    it("should return empty string for empty input", () => {
      expect(normalizeInvoiceRegistrationNumber("")).toBe("");
    });

    it("should convert to uppercase", () => {
      expect(normalizeInvoiceRegistrationNumber("t1234567890123")).toBe("T1234567890123");
    });

    it("should trim whitespace", () => {
      expect(normalizeInvoiceRegistrationNumber("  T1234567890123  ")).toBe("T1234567890123");
    });

    it("should handle mixed case and whitespace", () => {
      expect(normalizeInvoiceRegistrationNumber(" t1234567890123 ")).toBe("T1234567890123");
    });
  });

  describe("formatInvoiceRegistrationNumber", () => {
    it("should return empty string for empty input", () => {
      expect(formatInvoiceRegistrationNumber("")).toBe("");
    });

    it("should format valid number with hyphens", () => {
      expect(formatInvoiceRegistrationNumber("T1234567890123")).toBe("T 1234-5678-9012-3");
    });

    it("should handle lowercase input", () => {
      expect(formatInvoiceRegistrationNumber("t1234567890123")).toBe("T 1234-5678-9012-3");
    });

    it("should return original value for invalid length", () => {
      expect(formatInvoiceRegistrationNumber("T123")).toBe("T123");
    });

    it("should handle whitespace in input", () => {
      expect(formatInvoiceRegistrationNumber(" T1234567890123 ")).toBe("T 1234-5678-9012-3");
    });
  });
});
