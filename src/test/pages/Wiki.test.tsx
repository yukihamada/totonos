import { describe, it, expect } from "vitest";
import Wiki from "@/pages/Wiki";

describe("Wiki Page", () => {
  it("should export default component (redirect)", () => {
    expect(Wiki).toBeDefined();
    expect(typeof Wiki).toBe("function");
  });
});
