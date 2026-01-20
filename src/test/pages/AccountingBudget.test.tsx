import { describe, it, expect } from "vitest";
import AccountingBudget from "@/pages/AccountingBudget";

describe("AccountingBudget Page", () => {
  it("should export default component", () => {
    expect(AccountingBudget).toBeDefined();
    expect(typeof AccountingBudget).toBe("function");
  });
});
