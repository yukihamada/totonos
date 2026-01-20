import { describe, it, expect } from "vitest";
import Onboarding from "@/pages/Onboarding";

describe("Onboarding Page", () => {
  it("should export default component", () => {
    expect(Onboarding).toBeDefined();
    expect(typeof Onboarding).toBe("function");
  });
});
