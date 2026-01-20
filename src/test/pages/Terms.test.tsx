import { describe, it, expect } from "vitest";
import Terms from "@/pages/Terms";

describe("Terms Page", () => {
  it("should export default component", () => {
    expect(Terms).toBeDefined();
    expect(typeof Terms).toBe("function");
  });
});
