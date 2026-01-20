import { describe, it, expect } from "vitest";
import PaymentLinks from "@/pages/PaymentLinks";

describe("PaymentLinks Page", () => {
  it("should export default component", () => {
    expect(PaymentLinks).toBeDefined();
    expect(typeof PaymentLinks).toBe("function");
  });
});
