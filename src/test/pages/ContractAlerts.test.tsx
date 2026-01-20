import { describe, it, expect } from "vitest";
import ContractAlerts from "@/pages/ContractAlerts";

describe("ContractAlerts Page", () => {
  it("should export default component", () => {
    expect(ContractAlerts).toBeDefined();
    expect(typeof ContractAlerts).toBe("function");
  });
});
