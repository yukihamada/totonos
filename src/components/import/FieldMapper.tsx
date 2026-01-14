import { useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  TARGET_MODULE_FIELDS, 
  TARGET_MODULE_LABELS,
  type TargetModule,
  type FieldMapping,
  type MappingConfig 
} from "@/types/import";
import { ArrowRight, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FieldMapperProps {
  targetModule: TargetModule;
  sourceHeaders: string[];
  previewRows: string[][];
  onMappingChange: (config: MappingConfig) => void;
}

export function FieldMapper({ 
  targetModule, 
  sourceHeaders, 
  previewRows,
  onMappingChange 
}: FieldMapperProps) {
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [skipFirstRow, setSkipFirstRow] = useState(true);

  const targetFields = TARGET_MODULE_FIELDS[targetModule] || [];

  // Auto-map on mount
  useEffect(() => {
    autoMap();
  }, [sourceHeaders, targetModule]);

  useEffect(() => {
    onMappingChange({
      fieldMappings: mappings,
      skipFirstRow,
    });
  }, [mappings, skipFirstRow, onMappingChange]);

  const autoMap = () => {
    const newMappings: FieldMapping[] = targetFields.map((targetField) => {
      // Try to find matching source field
      const matchIndex = sourceHeaders.findIndex((header) => {
        const normalizedHeader = header.toLowerCase().replace(/[_\s-]/g, '');
        const normalizedTarget = targetField.toLowerCase().replace(/[_\s-]/g, '');
        
        // Check for exact match or common patterns
        return normalizedHeader === normalizedTarget ||
          normalizedHeader.includes(normalizedTarget) ||
          normalizedTarget.includes(normalizedHeader) ||
          matchCommonPatterns(normalizedHeader, targetField);
      });

      return {
        sourceField: matchIndex >= 0 ? matchIndex.toString() : '',
        targetField,
        transform: inferTransform(targetField),
      };
    });

    setMappings(newMappings);
  };

  const updateMapping = (index: number, sourceField: string) => {
    setMappings(prev => 
      prev.map((m, i) => 
        i === index ? { ...m, sourceField } : m
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">フィールドマッピング</h3>
          <p className="text-sm text-muted-foreground">
            インポート元のカラムと{TARGET_MODULE_LABELS[targetModule]}のフィールドを対応付けてください
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={autoMap}>
          <Wand2 className="h-4 w-4 mr-2" />
          自動マッピング
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="skip-first"
          checked={skipFirstRow}
          onCheckedChange={setSkipFirstRow}
        />
        <Label htmlFor="skip-first">1行目をヘッダーとしてスキップ</Label>
      </div>

      {/* Preview */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted px-4 py-2 text-sm font-medium">
          データプレビュー（最初の3行）
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {sourceHeaders.map((header, i) => (
                  <th key={i} className="px-4 py-2 text-left font-medium whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.slice(0, 3).map((row, i) => (
                <tr key={i} className="border-t">
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-2 whitespace-nowrap">
                      {cell || <span className="text-muted-foreground">-</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mapping fields */}
      <div className="space-y-4">
        {mappings.map((mapping, index) => (
          <div key={mapping.targetField} className="flex items-center gap-4">
            <div className="flex-1">
              <Select
                value={mapping.sourceField}
                onValueChange={(value) => updateMapping(index, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="カラムを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">未設定</SelectItem>
                  {sourceHeaders.map((header, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            
            <div className="flex-1 flex items-center gap-2">
              <span className="font-medium">{mapping.targetField}</span>
              {mapping.transform && mapping.transform !== 'none' && (
                <Badge variant="secondary" className="text-xs">
                  {mapping.transform}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper function to match common field name patterns
function matchCommonPatterns(source: string, target: string): boolean {
  const patterns: Record<string, string[]> = {
    name: ['名前', '氏名', 'なまえ', '会社名', '企業名'],
    email: ['メール', 'メールアドレス', 'eメール'],
    phone: ['電話', '電話番号', 'tel'],
    address: ['住所', '所在地'],
    amount: ['金額', '価格', '合計'],
    date: ['日付', '日時'],
    status: ['ステータス', '状態', '状況'],
    notes: ['備考', 'メモ', 'コメント'],
  };

  const targetPatterns = patterns[target];
  if (!targetPatterns) return false;

  return targetPatterns.some(p => source.includes(p.toLowerCase()));
}

// Helper function to infer transform type
function inferTransform(fieldName: string): FieldMapping['transform'] {
  if (fieldName.includes('date') || fieldName.includes('_at')) {
    return 'date';
  }
  if (fieldName.includes('amount') || fieldName.includes('price') || fieldName.includes('salary')) {
    return 'number';
  }
  if (fieldName.includes('is_') || fieldName.includes('active')) {
    return 'boolean';
  }
  return 'trim';
}
