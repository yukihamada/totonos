import { describe, it, expect } from "vitest";
import { WebhookSettings } from "@/pages/WebhookSettings";

describe("WebhookSettings Page", () => {
  it("should export component", () => {
    expect(WebhookSettings).toBeDefined();
    expect(typeof WebhookSettings).toBe("function");
  });
});
