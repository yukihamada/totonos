import { describe, it, expect } from "vitest";
import TrustPassport from "@/pages/TrustPassport";

describe("TrustPassport Page", () => {
  it("should export default component", () => {
    expect(TrustPassport).toBeDefined();
    expect(typeof TrustPassport).toBe("function");
  });
});
