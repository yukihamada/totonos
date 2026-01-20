import { describe, it, expect } from "vitest";
import InterviewSchedule from "@/pages/InterviewSchedule";

describe("InterviewSchedule Page", () => {
  it("should export default component", () => {
    expect(InterviewSchedule).toBeDefined();
    expect(typeof InterviewSchedule).toBe("function");
  });
});
