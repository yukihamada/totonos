import { describe, it, expect } from "vitest";
import ExpenseSettings from "@/pages/ExpenseSettings";

describe("ExpenseSettings Page", () => {
  it("should export default component", () => {
    expect(ExpenseSettings).toBeDefined();
    expect(typeof ExpenseSettings).toBe("function");
  });
});
