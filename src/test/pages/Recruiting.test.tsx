import { describe, it, expect } from "vitest";
import Recruiting from "@/pages/Recruiting";

describe("Recruiting Page", () => {
  it("should export default component", () => {
    expect(Recruiting).toBeDefined();
    expect(typeof Recruiting).toBe("function");
  });
});
