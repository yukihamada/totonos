import { describe, it, expect } from "vitest";
import MembershipPlans from "@/pages/membership/MembershipPlans";

describe("MembershipPlans Page", () => {
  it("should export default component", () => {
    expect(MembershipPlans).toBeDefined();
    expect(typeof MembershipPlans).toBe("function");
  });
});
