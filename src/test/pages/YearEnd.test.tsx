import { describe, it, expect } from "vitest";
import YearEnd from "@/pages/YearEnd";

describe("YearEnd Page", () => {
  it("should export default component", () => {
    expect(YearEnd).toBeDefined();
    expect(typeof YearEnd).toBe("function");
  });
});
