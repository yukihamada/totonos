import { describe, it, expect } from "vitest";
import BankConnections from "@/pages/BankConnections";

describe("BankConnections Page", () => {
  it("should export default component", () => {
    expect(BankConnections).toBeDefined();
    expect(typeof BankConnections).toBe("function");
  });
});
