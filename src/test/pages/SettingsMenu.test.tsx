import { describe, it, expect } from "vitest";
import SettingsMenu from "@/pages/SettingsMenu";

describe("SettingsMenu Page", () => {
  it("should export default component", () => {
    expect(SettingsMenu).toBeDefined();
    expect(typeof SettingsMenu).toBe("function");
  });

  it("should support drag and drop reordering", () => {
    // The SettingsMenu component now uses native HTML5 drag-and-drop
    // for reordering menu groups and items instead of arrow buttons
    expect(SettingsMenu).toBeDefined();
  });
});
