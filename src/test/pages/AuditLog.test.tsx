import { describe, it, expect } from "vitest";
import AuditLog from "@/pages/AuditLog";

describe("AuditLog Page", () => {
  it("should export default component", () => {
    expect(AuditLog).toBeDefined();
    expect(typeof AuditLog).toBe("function");
  });
});
