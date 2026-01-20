import { describe, it, expect } from "vitest";
import Candidates from "@/pages/Candidates";

describe("Candidates Page", () => {
  it("should export default component", () => {
    expect(Candidates).toBeDefined();
    expect(typeof Candidates).toBe("function");
  });
});
