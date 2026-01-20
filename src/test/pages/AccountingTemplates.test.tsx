import { describe, it, expect } from "vitest";
import AccountingTemplates from "@/pages/AccountingTemplates";

describe("AccountingTemplates Page", () => {
  it("should export default component", () => {
    expect(AccountingTemplates).toBeDefined();
    expect(typeof AccountingTemplates).toBe("function");
  });
});
