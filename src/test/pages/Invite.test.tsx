import { describe, it, expect } from "vitest";
import Invite from "@/pages/Invite";

describe("Invite Page", () => {
  it("should export default component", () => {
    expect(Invite).toBeDefined();
    expect(typeof Invite).toBe("function");
  });
});
