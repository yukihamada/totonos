import { describe, it, expect } from "vitest";
import AccountingCashFlow from "@/pages/AccountingCashFlow";

describe("AccountingCashFlow Page", () => {
  it("should export default component", () => {
    expect(AccountingCashFlow).toBeDefined();
    expect(typeof AccountingCashFlow).toBe("function");
  });
});
