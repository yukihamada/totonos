import { describe, it, expect } from "vitest";
import LineSettings from "@/pages/LineSettings";

describe("LineSettings Page", () => {
  it("should export default component", () => {
    expect(LineSettings).toBeDefined();
    expect(typeof LineSettings).toBe("function");
  });
});
