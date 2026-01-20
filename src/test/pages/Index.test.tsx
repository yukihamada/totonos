import { describe, it, expect } from "vitest";
import Index from "@/pages/Index";

describe("Index Page", () => {
  it("should export default component", () => {
    expect(Index).toBeDefined();
    expect(typeof Index).toBe("function");
  });
});
