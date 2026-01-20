import { describe, it, expect } from "vitest";
import ApprovalWorkflow from "@/pages/ApprovalWorkflow";

describe("ApprovalWorkflow Page", () => {
  it("should export default component", () => {
    expect(ApprovalWorkflow).toBeDefined();
    expect(typeof ApprovalWorkflow).toBe("function");
  });
});
