import { describe, it, expect } from "vitest";
import Boost from "@/pages/Boost";

describe("Boost Page", () => {
  it("should export default component", () => {
    expect(Boost).toBeDefined();
    expect(typeof Boost).toBe("function");
  });
});
