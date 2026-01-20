import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Download, FileJson, FileSpreadsheet, Loader2, Coins } from "lucide-react";
import { useExportWithCredits } from "@/hooks/useExportWithCredits";
import { ExportColumn } from "@/utils/export";
import { Badge } from "@/components/ui/badge";

interface ExportButtonProps<T extends Record<string, any>> {
  data: T[];
  columns: ExportColumn<T>[];
  filename: string;
  disabled?: boolean;
  /**
   * 解約前の最終エクスポートかどうか（無料）
   */
  isFinalExportBeforeCancellation?: boolean;
}

/**
 * クレジット消費付きエクスポートボタン
 * 
 * サービス契約第3条4項に準拠：
 * - JSON形式またはCSV形式でエクスポート可能
 * - エクスポートにはクレジットを消費
 * - 解約前の最終エクスポートは無料
 */
export function ExportButton<T extends Record<string, any>>({
  data,
  columns,
  filename,
  disabled = false,
  isFinalExportBeforeCancellation = false,
}: ExportButtonProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const { exportCsv, exportJson, canExport, exportCost, isExporting } =
    useExportWithCredits({ isFinalExportBeforeCancellation });

  const handleExportCsv = async () => {
    setIsOpen(false);
    await exportCsv(data, columns, filename);
  };

  const handleExportJson = async () => {
    setIsOpen(false);
    await exportJson(data, filename);
  };

  const isDisabled = disabled || isExporting || (!canExport && !isFinalExportBeforeCancellation);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isDisabled}>
                  {isExporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  エクスポート
                  {!isFinalExportBeforeCancellation && (
                    <Badge variant="secondary" className="ml-2 flex items-center gap-1">
                      <Coins className="h-3 w-3" />
                      {exportCost}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportCsv}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  CSV形式でエクスポート
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportJson}>
                  <FileJson className="mr-2 h-4 w-4" />
                  JSON形式でエクスポート
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {isFinalExportBeforeCancellation ? (
            <p>解約前の最終エクスポート（無料）</p>
          ) : canExport ? (
            <p>{data.length}件のデータをエクスポート（{exportCost}クレジット消費）</p>
          ) : (
            <p>クレジットが不足しています</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
