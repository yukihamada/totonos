import { describe, it, expect } from "vitest";
import Referrals from "@/pages/Referrals";

describe("Referrals Page", () => {
  it("should export default component", () => {
    expect(Referrals).toBeDefined();
    expect(typeof Referrals).toBe("function");
  });
});
