import { describe, it, expect } from "vitest";
import Shifts from "@/pages/Shifts";

describe("Shifts Page", () => {
  it("should export default component", () => {
    expect(Shifts).toBeDefined();
    expect(typeof Shifts).toBe("function");
  });
});
