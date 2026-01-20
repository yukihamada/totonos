import { describe, it, expect } from "vitest";
import ProjectKanban from "@/pages/ProjectKanban";

describe("ProjectKanban Page", () => {
  it("should export default component", () => {
    expect(ProjectKanban).toBeDefined();
    expect(typeof ProjectKanban).toBe("function");
  });
});
