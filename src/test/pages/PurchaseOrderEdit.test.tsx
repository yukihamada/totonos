import { describe, it, expect } from "vitest";
import PurchaseOrderEdit from "@/pages/PurchaseOrderEdit";

describe("PurchaseOrderEdit Page", () => {
  it("should export default component", () => {
    expect(PurchaseOrderEdit).toBeDefined();
    expect(typeof PurchaseOrderEdit).toBe("function");
  });
});
