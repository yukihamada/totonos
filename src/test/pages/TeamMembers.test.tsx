import { describe, it, expect } from "vitest";
import TeamMembers from "@/pages/TeamMembers";

describe("TeamMembers Page", () => {
  it("should export default component", () => {
    expect(TeamMembers).toBeDefined();
    expect(typeof TeamMembers).toBe("function");
  });
});
