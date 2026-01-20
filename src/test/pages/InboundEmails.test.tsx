import { describe, it, expect } from "vitest";
import InboundEmails from "@/pages/InboundEmails";

describe("InboundEmails Page", () => {
  it("should export default component", () => {
    expect(InboundEmails).toBeDefined();
    expect(typeof InboundEmails).toBe("function");
  });
});
