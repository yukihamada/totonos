import { describe, it, expect } from "vitest";
import ApiDocs from "@/pages/ApiDocs";

describe("ApiDocs Page", () => {
  it("should export default component", () => {
    expect(ApiDocs).toBeDefined();
    expect(typeof ApiDocs).toBe("function");
  });
});
