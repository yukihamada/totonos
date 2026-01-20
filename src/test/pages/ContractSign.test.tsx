import { describe, it, expect } from "vitest";
import ContractSign from "@/pages/ContractSign";

describe("ContractSign Page", () => {
  it("should export default component", () => {
    expect(ContractSign).toBeDefined();
    expect(typeof ContractSign).toBe("function");
  });
});
