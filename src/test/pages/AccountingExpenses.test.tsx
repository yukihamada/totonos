import { describe, it, expect } from "vitest";
import AccountingExpenses from "@/pages/AccountingExpenses";

describe("AccountingExpenses Page", () => {
  it("should export default component", () => {
    expect(AccountingExpenses).toBeDefined();
    expect(typeof AccountingExpenses).toBe("function");
  });
});
