import { describe, it, expect } from "vitest";
import EmailIntegration from "@/pages/EmailIntegration";

describe("EmailIntegration Page", () => {
  it("should export default component", () => {
    expect(EmailIntegration).toBeDefined();
    expect(typeof EmailIntegration).toBe("function");
  });
});
