import { describe, it, expect } from "vitest";
import AccountingAssets from "@/pages/AccountingAssets";

describe("AccountingAssets Page", () => {
  it("should export default component", () => {
    expect(AccountingAssets).toBeDefined();
    expect(typeof AccountingAssets).toBe("function");
  });
});
