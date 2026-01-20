import { describe, it, expect } from "vitest";
import JobPostingNew from "@/pages/JobPostingNew";

describe("JobPostingNew Page", () => {
  it("should export default component", () => {
    expect(JobPostingNew).toBeDefined();
    expect(typeof JobPostingNew).toBe("function");
  });
});
