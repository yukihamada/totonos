import { describe, it, expect } from "vitest";
import AccountingSettings from "@/pages/AccountingSettings";

describe("AccountingSettings Page", () => {
  it("should export default component", () => {
    expect(AccountingSettings).toBeDefined();
    expect(typeof AccountingSettings).toBe("function");
  });
});
