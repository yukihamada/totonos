import { describe, it, expect } from "vitest";
import { BackupSettings } from "@/pages/BackupSettings";

describe("BackupSettings Page", () => {
  it("should export component", () => {
    expect(BackupSettings).toBeDefined();
    expect(typeof BackupSettings).toBe("function");
  });
});
