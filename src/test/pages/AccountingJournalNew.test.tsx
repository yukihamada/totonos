import { describe, it, expect } from "vitest";
import AccountingJournalNew from "@/pages/AccountingJournalNew";

describe("AccountingJournalNew Page", () => {
  it("should export default component", () => {
    expect(AccountingJournalNew).toBeDefined();
    expect(typeof AccountingJournalNew).toBe("function");
  });
});
