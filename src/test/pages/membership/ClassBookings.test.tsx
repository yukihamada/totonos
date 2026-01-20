import { describe, it, expect } from "vitest";
import ClassBookings from "@/pages/membership/ClassBookings";

describe("ClassBookings Page", () => {
  it("should export default component", () => {
    expect(ClassBookings).toBeDefined();
    expect(typeof ClassBookings).toBe("function");
  });
});
