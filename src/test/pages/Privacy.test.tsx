import { describe, it, expect } from "vitest";
import Privacy from "@/pages/Privacy";

describe("Privacy Page", () => {
  it("should export default component", () => {
    expect(Privacy).toBeDefined();
    expect(typeof Privacy).toBe("function");
  });
});
