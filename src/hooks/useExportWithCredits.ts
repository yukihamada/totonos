import { useCallback } from "react";
import { useConsumeCredits, useHybridCredits, CREDIT_COSTS } from "./useCreditsV2";
import { exportToCsv, exportToJson, ExportColumn } from "@/utils/export";
import { toast } from "sonner";

interface UseExportWithCreditsOptions {
  /**
   * 解約前の最終エクスポートかどうか（無料）
   * サービス契約第3条4項に基づく
   */
  isFinalExportBeforeCancellation?: boolean;
}

interface UseExportWithCreditsReturn {
  exportCsv: <T extends Record<string, any>>(
    data: T[],
    columns: ExportColumn<T>[],
    filename: string
  ) => Promise<boolean>;
  exportJson: <T>(data: T[], filename: string) => Promise<boolean>;
  canExport: boolean;
  exportCost: number;
  isExporting: boolean;
}

/**
 * クレジット消費付きエクスポートフック
 * 
 * サービス契約第3条4項に準拠：
 * - エクスポートにはクレジットを消費
 * - 解約前の最終エクスポートは無料
 */
export function useExportWithCredits(
  options: UseExportWithCreditsOptions = {}
): UseExportWithCreditsReturn {
  const { isFinalExportBeforeCancellation = false } = options;
  const { canUse, totalRemaining } = useHybridCredits();
  const consumeCredits = useConsumeCredits();

  const exportCost = CREDIT_COSTS.export.cost;
  const canExport = isFinalExportBeforeCancellation || canUse("export");

  const performExport = useCallback(
    async (
      exportFn: () => void,
      dataType: string,
      recordCount: number
    ): Promise<boolean> => {
      // 解約前の最終エクスポートは無料
      if (!isFinalExportBeforeCancellation) {
        if (!canUse("export")) {
          toast.error("クレジットが不足しています", {
            description: `エクスポートには${exportCost}クレジットが必要です（残り: ${totalRemaining}）`,
          });
          return false;
        }

        try {
          await consumeCredits.mutateAsync({
            action: "export",
            description: `${dataType}エクスポート（${recordCount}件）`,
          });
        } catch {
          return false;
        }
      }

      try {
        exportFn();
        toast.success("エクスポート完了", {
          description: isFinalExportBeforeCancellation
            ? `${dataType}を${recordCount}件エクスポートしました（解約前最終エクスポート - 無料）`
            : `${dataType}を${recordCount}件エクスポートしました（${exportCost}クレジット消費）`,
        });
        return true;
      } catch (error) {
        toast.error("エクスポートに失敗しました");
        return false;
      }
    },
    [canUse, consumeCredits, exportCost, isFinalExportBeforeCancellation, totalRemaining]
  );

  const exportCsv = useCallback(
    async <T extends Record<string, any>>(
      data: T[],
      columns: ExportColumn<T>[],
      filename: string
    ): Promise<boolean> => {
      return performExport(
        () => exportToCsv(data, columns, filename),
        filename,
        data.length
      );
    },
    [performExport]
  );

  const exportJson = useCallback(
    async <T>(data: T[], filename: string): Promise<boolean> => {
      return performExport(
        () => exportToJson(data, filename),
        filename,
        Array.isArray(data) ? data.length : 1
      );
    },
    [performExport]
  );

  return {
    exportCsv,
    exportJson,
    canExport,
    exportCost,
    isExporting: consumeCredits.isPending,
  };
}
