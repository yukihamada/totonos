import { describe, it, expect } from "vitest";
import ProjectNew from "@/pages/ProjectNew";

describe("ProjectNew Page", () => {
  it("should export default component", () => {
    expect(ProjectNew).toBeDefined();
    expect(typeof ProjectNew).toBe("function");
  });
});
