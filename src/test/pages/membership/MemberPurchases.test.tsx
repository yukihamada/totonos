import { describe, it, expect } from "vitest";
import MemberPurchases from "@/pages/membership/MemberPurchases";

describe("MemberPurchases Page", () => {
  it("should export default component", () => {
    expect(MemberPurchases).toBeDefined();
    expect(typeof MemberPurchases).toBe("function");
  });
});
