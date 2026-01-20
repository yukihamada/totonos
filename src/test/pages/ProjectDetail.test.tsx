import { describe, it, expect } from "vitest";
import ProjectDetail from "@/pages/ProjectDetail";

describe("ProjectDetail Page", () => {
  it("should export default component", () => {
    expect(ProjectDetail).toBeDefined();
    expect(typeof ProjectDetail).toBe("function");
  });
});
