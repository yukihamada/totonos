import { describe, it, expect } from "vitest";
import ReceiptCapture from "@/pages/ReceiptCapture";

describe("ReceiptCapture Page", () => {
  it("should export default component", () => {
    expect(ReceiptCapture).toBeDefined();
    expect(typeof ReceiptCapture).toBe("function");
  });
});
