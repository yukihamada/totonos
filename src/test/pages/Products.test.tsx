import { describe, it, expect } from "vitest";
import Products from "@/pages/Products";

describe("Products Page", () => {
  it("should export default component", () => {
    expect(Products).toBeDefined();
    expect(typeof Products).toBe("function");
  });
});
