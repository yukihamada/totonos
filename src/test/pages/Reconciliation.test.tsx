import { describe, it, expect } from "vitest";
import Reconciliation from "@/pages/Reconciliation";

describe("Reconciliation Page", () => {
  it("should export default component", () => {
    expect(Reconciliation).toBeDefined();
    expect(typeof Reconciliation).toBe("function");
  });
});
