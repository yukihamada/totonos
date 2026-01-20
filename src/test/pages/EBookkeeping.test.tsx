import { describe, it, expect } from "vitest";
import EBookkeeping from "@/pages/EBookkeeping";

describe("EBookkeeping Page", () => {
  it("should export default component", () => {
    expect(EBookkeeping).toBeDefined();
    expect(typeof EBookkeeping).toBe("function");
  });
});
