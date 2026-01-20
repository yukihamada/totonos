import { describe, it, expect } from "vitest";
import CandidateDetail from "@/pages/CandidateDetail";

describe("CandidateDetail Page", () => {
  it("should export default component", () => {
    expect(CandidateDetail).toBeDefined();
    expect(typeof CandidateDetail).toBe("function");
  });
});
