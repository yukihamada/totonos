import { describe, it, expect } from "vitest";
import DataImport from "@/pages/DataImport";

describe("DataImport Page", () => {
  it("should export default component", () => {
    expect(DataImport).toBeDefined();
    expect(typeof DataImport).toBe("function");
  });
});
