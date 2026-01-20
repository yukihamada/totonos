import { describe, it, expect } from "vitest";
import ContractEdit from "@/pages/ContractEdit";

describe("ContractEdit Page", () => {
  it("should export default component", () => {
    expect(ContractEdit).toBeDefined();
    expect(typeof ContractEdit).toBe("function");
  });
});
