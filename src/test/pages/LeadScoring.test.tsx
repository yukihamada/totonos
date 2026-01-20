import { describe, it, expect } from "vitest";
import LeadScoring from "@/pages/LeadScoring";

describe("LeadScoring Page", () => {
  it("should export default component", () => {
    expect(LeadScoring).toBeDefined();
    expect(typeof LeadScoring).toBe("function");
  });
});
