import { describe, it, expect } from "vitest";
import PurchaseOrderDetail from "@/pages/PurchaseOrderDetail";

describe("PurchaseOrderDetail Page", () => {
  it("should export default component", () => {
    expect(PurchaseOrderDetail).toBeDefined();
    expect(typeof PurchaseOrderDetail).toBe("function");
  });
});
