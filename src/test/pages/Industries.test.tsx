import { describe, it, expect } from "vitest";
import Industries from "@/pages/Industries";

describe("Industries Page", () => {
  it("should export default component", () => {
    expect(Industries).toBeDefined();
    expect(typeof Industries).toBe("function");
  });
});
