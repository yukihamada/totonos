import { describe, it, expect } from "vitest";
import SocialInsurance from "@/pages/SocialInsurance";

describe("SocialInsurance Page", () => {
  it("should export default component", () => {
    expect(SocialInsurance).toBeDefined();
    expect(typeof SocialInsurance).toBe("function");
  });
});
