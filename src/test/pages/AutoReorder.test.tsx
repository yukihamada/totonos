import { describe, it, expect } from "vitest";
import AutoReorder from "@/pages/AutoReorder";

describe("AutoReorder Page", () => {
  it("should export default component", () => {
    expect(AutoReorder).toBeDefined();
    expect(typeof AutoReorder).toBe("function");
  });
});
