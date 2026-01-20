import { describe, it, expect } from "vitest";
import Notifications from "@/pages/Notifications";

describe("Notifications Page", () => {
  it("should export default component", () => {
    expect(Notifications).toBeDefined();
    expect(typeof Notifications).toBe("function");
  });
});
