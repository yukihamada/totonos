import { describe, it, expect } from "vitest";
import WikiHierarchy from "@/pages/WikiHierarchy";

describe("WikiHierarchy Page", () => {
  it("should export default component", () => {
    expect(WikiHierarchy).toBeDefined();
    expect(typeof WikiHierarchy).toBe("function");
  });
});
