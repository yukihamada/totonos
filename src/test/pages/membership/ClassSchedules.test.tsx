import { describe, it, expect } from "vitest";
import ClassSchedules from "@/pages/membership/ClassSchedules";

describe("ClassSchedules Page", () => {
  it("should export default component", () => {
    expect(ClassSchedules).toBeDefined();
    expect(typeof ClassSchedules).toBe("function");
  });
});
