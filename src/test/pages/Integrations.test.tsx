import { describe, it, expect } from "vitest";
import Integrations from "@/pages/Integrations";

describe("Integrations Page", () => {
  it("should export default component", () => {
    expect(Integrations).toBeDefined();
    expect(typeof Integrations).toBe("function");
  });
});
