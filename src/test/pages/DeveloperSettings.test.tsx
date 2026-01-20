import { describe, it, expect } from "vitest";
import DeveloperSettings from "@/pages/DeveloperSettings";

describe("DeveloperSettings Page", () => {
  it("should export default component", () => {
    expect(DeveloperSettings).toBeDefined();
    expect(typeof DeveloperSettings).toBe("function");
  });
});
