import { describe, it, expect } from "vitest";
import AccountingCostCenters from "@/pages/AccountingCostCenters";

describe("AccountingCostCenters Page", () => {
  it("should export default component", () => {
    expect(AccountingCostCenters).toBeDefined();
    expect(typeof AccountingCostCenters).toBe("function");
  });
});
