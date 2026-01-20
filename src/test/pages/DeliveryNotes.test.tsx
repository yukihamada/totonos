import { describe, it, expect } from "vitest";
import DeliveryNotes from "@/pages/DeliveryNotes";

describe("DeliveryNotes Page", () => {
  it("should export default component", () => {
    expect(DeliveryNotes).toBeDefined();
    expect(typeof DeliveryNotes).toBe("function");
  });
});
