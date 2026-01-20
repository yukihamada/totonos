import { describe, it, expect } from "vitest";
import Clients from "@/pages/Clients";

describe("Clients Page", () => {
  it("should export default component", () => {
    expect(Clients).toBeDefined();
    expect(typeof Clients).toBe("function");
  });
});
