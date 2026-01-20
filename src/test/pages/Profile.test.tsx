import { describe, it, expect } from "vitest";
import Profile from "@/pages/Profile";

describe("Profile Page", () => {
  it("should export default component", () => {
    expect(Profile).toBeDefined();
    expect(typeof Profile).toBe("function");
  });
});
