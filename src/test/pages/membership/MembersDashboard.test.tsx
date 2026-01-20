import { describe, it, expect } from "vitest";
import MembersDashboard from "@/pages/membership/MembersDashboard";

describe("MembersDashboard Page", () => {
  it("should export default component", () => {
    expect(MembersDashboard).toBeDefined();
    expect(typeof MembersDashboard).toBe("function");
  });
});
