import { describe, it, expect } from "vitest";
import MembersList from "@/pages/membership/MembersList";

describe("MembersList Page", () => {
  it("should export default component", () => {
    expect(MembersList).toBeDefined();
    expect(typeof MembersList).toBe("function");
  });
});
