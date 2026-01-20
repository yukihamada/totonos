import { describe, it, expect } from "vitest";
import JobPostings from "@/pages/JobPostings";

describe("JobPostings Page", () => {
  it("should export default component", () => {
    expect(JobPostings).toBeDefined();
    expect(typeof JobPostings).toBe("function");
  });
});
