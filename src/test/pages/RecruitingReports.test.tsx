import { describe, it, expect } from "vitest";
import RecruitingReports from "@/pages/RecruitingReports";

describe("RecruitingReports Page", () => {
  it("should export default component", () => {
    expect(RecruitingReports).toBeDefined();
    expect(typeof RecruitingReports).toBe("function");
  });
});
