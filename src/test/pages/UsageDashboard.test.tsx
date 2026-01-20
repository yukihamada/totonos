import { describe, it, expect } from "vitest";
import { UsageDashboard } from "@/pages/UsageDashboard";

describe("UsageDashboard Page", () => {
  it("should export component", () => {
    expect(UsageDashboard).toBeDefined();
    expect(typeof UsageDashboard).toBe("function");
  });
});
