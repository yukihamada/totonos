import { describe, it, expect } from "vitest";
import EstimateEdit from "@/pages/EstimateEdit";

describe("EstimateEdit Page", () => {
  it("should export default component", () => {
    expect(EstimateEdit).toBeDefined();
    expect(typeof EstimateEdit).toBe("function");
  });
});
