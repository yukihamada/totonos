import { describe, it, expect } from "vitest";
import GettingStarted from "@/pages/GettingStarted";

describe("GettingStarted Page", () => {
  it("should export default component", () => {
    expect(GettingStarted).toBeDefined();
    expect(typeof GettingStarted).toBe("function");
  });
});
