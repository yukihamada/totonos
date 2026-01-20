import { describe, it, expect } from "vitest";
import InvoiceEdit from "@/pages/InvoiceEdit";

describe("InvoiceEdit Page", () => {
  it("should export default component", () => {
    expect(InvoiceEdit).toBeDefined();
    expect(typeof InvoiceEdit).toBe("function");
  });
});
