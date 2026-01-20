import { describe, it, expect } from "vitest";
import ProjectGantt from "@/pages/ProjectGantt";

describe("ProjectGantt Page", () => {
  it("should export default component", () => {
    expect(ProjectGantt).toBeDefined();
    expect(typeof ProjectGantt).toBe("function");
  });
});
