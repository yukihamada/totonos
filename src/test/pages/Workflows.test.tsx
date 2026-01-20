import { describe, it, expect } from "vitest";
import Workflows from "@/pages/Workflows";

describe("Workflows Page", () => {
  it("should export default component", () => {
    expect(Workflows).toBeDefined();
    expect(typeof Workflows).toBe("function");
  });
});
