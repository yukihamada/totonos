import { describe, it, expect } from "vitest";
import MemberCheckins from "@/pages/membership/MemberCheckins";

describe("MemberCheckins Page", () => {
  it("should export default component", () => {
    expect(MemberCheckins).toBeDefined();
    expect(typeof MemberCheckins).toBe("function");
  });
});
