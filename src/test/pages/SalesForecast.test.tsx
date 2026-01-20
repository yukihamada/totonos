import { describe, it, expect } from "vitest";
import SalesForecast from "@/pages/SalesForecast";

describe("SalesForecast Page", () => {
  it("should export default component", () => {
    expect(SalesForecast).toBeDefined();
    expect(typeof SalesForecast).toBe("function");
  });
});
