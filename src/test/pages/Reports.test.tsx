import { describe, it, expect } from "vitest";
import Reports from "@/pages/Reports";

describe("Reports Page", () => {
  it("should export default component", () => {
    expect(Reports).toBeDefined();
    expect(typeof Reports).toBe("function");
  });
});
