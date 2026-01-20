import { describe, it, expect } from "vitest";
import AccountingTax from "@/pages/AccountingTax";

describe("AccountingTax Page", () => {
  it("should export default component", () => {
    expect(AccountingTax).toBeDefined();
    expect(typeof AccountingTax).toBe("function");
  });
});
