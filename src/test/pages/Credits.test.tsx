import { describe, it, expect } from "vitest";
import Credits from "@/pages/Credits";

describe("Credits Page", () => {
  it("should export default component", () => {
    expect(Credits).toBeDefined();
    expect(typeof Credits).toBe("function");
  });
});
