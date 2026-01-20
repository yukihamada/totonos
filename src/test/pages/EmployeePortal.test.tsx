import { describe, it, expect } from "vitest";
import EmployeePortal from "@/pages/EmployeePortal";

describe("EmployeePortal Page", () => {
  it("should export default component", () => {
    expect(EmployeePortal).toBeDefined();
    expect(typeof EmployeePortal).toBe("function");
  });
});
