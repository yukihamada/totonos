import { describe, it, expect } from "vitest";
import AISettings from "@/pages/AISettings";

describe("AISettings Page", () => {
  it("should export default component", () => {
    expect(AISettings).toBeDefined();
    expect(typeof AISettings).toBe("function");
  });
});
