import { describe, it, expect } from "vitest";
import AccountingReceivables from "@/pages/AccountingReceivables";

describe("AccountingReceivables Page", () => {
  it("should export default component", () => {
    expect(AccountingReceivables).toBeDefined();
    expect(typeof AccountingReceivables).toBe("function");
  });
});
