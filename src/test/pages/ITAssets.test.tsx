import { describe, it, expect } from "vitest";
import ITAssets from "@/pages/ITAssets";

describe("ITAssets Page", () => {
  it("should export default component", () => {
    expect(ITAssets).toBeDefined();
    expect(typeof ITAssets).toBe("function");
  });
});
