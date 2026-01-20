import { describe, it, expect } from "vitest";
import EmailTemplates from "@/pages/EmailTemplates";

describe("EmailTemplates Page", () => {
  it("should export default component", () => {
    expect(EmailTemplates).toBeDefined();
    expect(typeof EmailTemplates).toBe("function");
  });
});
