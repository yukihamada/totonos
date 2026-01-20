import { describe, it, expect } from "vitest";
import DatabaseViews from "@/pages/DatabaseViews";

describe("DatabaseViews Page", () => {
  it("should export default component", () => {
    expect(DatabaseViews).toBeDefined();
    expect(typeof DatabaseViews).toBe("function");
  });
});
