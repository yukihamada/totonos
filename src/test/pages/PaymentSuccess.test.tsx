import { describe, it, expect } from "vitest";
import PaymentSuccess from "@/pages/PaymentSuccess";

describe("PaymentSuccess Page", () => {
  it("should export default component", () => {
    expect(PaymentSuccess).toBeDefined();
    expect(typeof PaymentSuccess).toBe("function");
  });
});
