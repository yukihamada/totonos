import { describe, it, expect } from "vitest";
import {
  stageColors,
  stageLabels,
  leadStatusLabels,
  sourceLabels,
  activityTypeLabels,
} from "@/types/crm";

describe("CRM Types and Labels", () => {
  describe("stageColors", () => {
    it("returns correct color for initial stage", () => {
      expect(stageColors.initial).toBe("bg-muted");
    });

    it("returns correct color for proposal stage", () => {
      expect(stageColors.proposal).toBe("bg-blue-100 dark:bg-blue-900");
    });

    it("returns correct color for negotiation stage", () => {
      expect(stageColors.negotiation).toBe("bg-yellow-100 dark:bg-yellow-900");
    });

    it("returns correct color for contract stage", () => {
      expect(stageColors.contract).toBe("bg-purple-100 dark:bg-purple-900");
    });

    it("returns correct color for won stage", () => {
      expect(stageColors.won).toBe("bg-green-100 dark:bg-green-900");
    });

    it("returns correct color for lost stage", () => {
      expect(stageColors.lost).toBe("bg-red-100 dark:bg-red-900");
    });
  });

  describe("stageLabels", () => {
    it("returns correct Japanese label for each stage", () => {
      expect(stageLabels.initial).toBe("初期接触");
      expect(stageLabels.proposal).toBe("提案中");
      expect(stageLabels.negotiation).toBe("交渉中");
      expect(stageLabels.contract).toBe("契約手続き");
      expect(stageLabels.won).toBe("受注");
      expect(stageLabels.lost).toBe("失注");
    });
  });

  describe("leadStatusLabels", () => {
    it("returns correct Japanese label for new status", () => {
      expect(leadStatusLabels.new).toBe("新規");
    });

    it("returns correct Japanese label for contacted status", () => {
      expect(leadStatusLabels.contacted).toBe("連絡済み");
    });

    it("returns correct Japanese label for qualified status", () => {
      expect(leadStatusLabels.qualified).toBe("見込み確定");
    });

    it("returns correct Japanese label for converted status", () => {
      expect(leadStatusLabels.converted).toBe("顧客化");
    });

    it("returns correct Japanese label for lost status", () => {
      expect(leadStatusLabels.lost).toBe("失注");
    });
  });

  describe("sourceLabels", () => {
    it("returns correct Japanese label for website source", () => {
      expect(sourceLabels.website).toBe("ウェブサイト");
    });

    it("returns correct Japanese label for referral source", () => {
      expect(sourceLabels.referral).toBe("紹介");
    });

    it("returns correct Japanese label for exhibition source", () => {
      expect(sourceLabels.exhibition).toBe("展示会");
    });

    it("returns correct Japanese label for cold_call source", () => {
      expect(sourceLabels.cold_call).toBe("電話営業");
    });

    it("returns correct Japanese label for advertising source", () => {
      expect(sourceLabels.advertising).toBe("広告");
    });

    it("returns correct Japanese label for other source", () => {
      expect(sourceLabels.other).toBe("その他");
    });
  });

  describe("activityTypeLabels", () => {
    it("returns correct Japanese label for call activity", () => {
      expect(activityTypeLabels.call).toBe("電話");
    });

    it("returns correct Japanese label for meeting activity", () => {
      expect(activityTypeLabels.meeting).toBe("会議");
    });

    it("returns correct Japanese label for email activity", () => {
      expect(activityTypeLabels.email).toBe("メール");
    });

    it("returns correct Japanese label for visit activity", () => {
      expect(activityTypeLabels.visit).toBe("訪問");
    });

    it("returns correct Japanese label for demo activity", () => {
      expect(activityTypeLabels.demo).toBe("デモ");
    });

    it("returns correct Japanese label for other activity", () => {
      expect(activityTypeLabels.other).toBe("その他");
    });
  });
});
