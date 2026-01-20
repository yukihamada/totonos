import { describe, it, expect } from "vitest";
import SSOSettings from "@/pages/SSOSettings";

describe("SSOSettings Page", () => {
  it("should export default component", () => {
    expect(SSOSettings).toBeDefined();
    expect(typeof SSOSettings).toBe("function");
  });
});
