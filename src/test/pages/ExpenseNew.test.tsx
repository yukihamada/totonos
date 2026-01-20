import { describe, it, expect } from "vitest";
import ExpenseNew from "@/pages/ExpenseNew";

describe("ExpenseNew Page", () => {
  it("should export default component", () => {
    expect(ExpenseNew).toBeDefined();
    expect(typeof ExpenseNew).toBe("function");
  });
});
