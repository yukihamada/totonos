import { describe, it, expect } from "vitest";
import AccountingPeriodClose from "@/pages/AccountingPeriodClose";

describe("AccountingPeriodClose Page", () => {
  it("should export default component", () => {
    expect(AccountingPeriodClose).toBeDefined();
    expect(typeof AccountingPeriodClose).toBe("function");
  });
});
