import { describe, it, expect } from "vitest";
import ExpenseDetail from "@/pages/ExpenseDetail";

describe("ExpenseDetail Page", () => {
  it("should export default component", () => {
    expect(ExpenseDetail).toBeDefined();
    expect(typeof ExpenseDetail).toBe("function");
  });
});
