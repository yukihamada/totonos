import { describe, it, expect } from "vitest";
import SettingsMenu from "@/pages/SettingsMenu";

describe("SettingsMenu Page", () => {
  it("should export default component", () => {
    expect(SettingsMenu).toBeDefined();
    expect(typeof SettingsMenu).toBe("function");
  });
});
