import { describe, it, expect } from "vitest";
import AccountingPayables from "@/pages/AccountingPayables";

describe("AccountingPayables Page", () => {
  it("should export default component", () => {
    expect(AccountingPayables).toBeDefined();
    expect(typeof AccountingPayables).toBe("function");
  });
});
