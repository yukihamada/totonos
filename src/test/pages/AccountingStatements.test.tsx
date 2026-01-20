import { describe, it, expect } from "vitest";
import AccountingStatements from "@/pages/AccountingStatements";

describe("AccountingStatements Page", () => {
  it("should export default component", () => {
    expect(AccountingStatements).toBeDefined();
    expect(typeof AccountingStatements).toBe("function");
  });
});
