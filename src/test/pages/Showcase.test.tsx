import { describe, it, expect } from "vitest";
import Showcase from "@/pages/Showcase";

describe("Showcase Page", () => {
  it("should export default component", () => {
    expect(Showcase).toBeDefined();
    expect(typeof Showcase).toBe("function");
  });
});
