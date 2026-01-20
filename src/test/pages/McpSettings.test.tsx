import { describe, it, expect } from "vitest";
import McpSettings from "@/pages/McpSettings";

describe("McpSettings Page", () => {
  it("should export default component", () => {
    expect(McpSettings).toBeDefined();
    expect(typeof McpSettings).toBe("function");
  });
});
