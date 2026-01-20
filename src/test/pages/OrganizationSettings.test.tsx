import { describe, it, expect } from "vitest";
import OrganizationSettings from "@/pages/OrganizationSettings";

describe("OrganizationSettings Page", () => {
  it("should export default component", () => {
    expect(OrganizationSettings).toBeDefined();
    expect(typeof OrganizationSettings).toBe("function");
  });
});
