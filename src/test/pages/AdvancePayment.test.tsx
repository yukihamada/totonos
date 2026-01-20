import { describe, it, expect } from "vitest";
import AdvancePayment from "@/pages/AdvancePayment";

describe("AdvancePayment Page", () => {
  it("should export default component", () => {
    expect(AdvancePayment).toBeDefined();
    expect(typeof AdvancePayment).toBe("function");
  });
});
