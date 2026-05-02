import { useState } from 'react';
import {
  Download,
  Upload,
  Calendar,
  Database,
  FileJson,
  FileSpreadsheet,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const EXPORT_CATEGORIES = [
  { value: 'all', label: '全データ', description: 'すべてのテーブルをエクスポート' },
  { value: 'financial', label: '財務データ', description: '請求書、仕訳、経費精算など' },
  { value: 'accounting', label: '会計データ（freee/弥生対応）', description: '勘定科目・仕訳・予算（会計ソフト互換）' },
  { value: 'crm', label: 'CRMデータ', description: 'リード、商談、顧客など' },
  { value: 'hr', label: '人事データ', description: '従業員、勤怠、休暇申請など' },
  { value: 'contracts', label: '契約データ', description: '契約書、見積書、発注書など' },
  { value: 'admin_stats', label: '管理者向け全社統計', description: '全社データの統計サマリ（管理者専用）' },
];

const EXPORT_FORMATS = [
  { value: 'json', label: 'JSON（完全データ）', icon: FileJson },
  { value: 'csv', label: 'CSV（Excel互換）', icon: FileSpreadsheet },
  { value: 'xlsx', label: 'Excel (.xlsx・複数シート)', icon: FileSpreadsheet },
  { value: 'freee', label: 'freee CSV（会計のみ）', icon: FileSpreadsheet },
  { value: 'yayoi', label: '弥生会計 CSV（会計のみ）', icon: FileSpreadsheet },
];

interface BackupHistory {
  id: string;
  date: string;
  category: string;
  format: string;
  size: number;
  status: 'completed' | 'failed';
}

// Mock backup history (would come from API in production)
const mockHistory: BackupHistory[] = [
  {
    id: '1',
    date: '2026-01-14T10:30:00Z',
    category: 'all',
    format: 'json',
    size: 2456789,
    status: 'completed',
  },
  {
    id: '2',
    date: '2026-01-13T15:45:00Z',
    category: 'financial',
    format: 'csv',
    size: 1234567,
    status: 'completed',
  },
];

export function BackupSettings() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [category, setCategory] = useState('all');
  const [format, setFormat] = useState('json');
  const [isExporting, setIsExporting] = useState(false);
  const [backupHistory] = useState<BackupHistory[]>(mockHistory);

  const handleExport = async () => {
    if (!session?.access_token) {
      toast({
        title: 'エラー',
        description: 'ログインが必要です',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/backup-export`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ category, format }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'エクスポートに失敗しました');
      }

      // Get filename from header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || `backup.${format}`;

      // Download the file
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'エクスポート完了',
        description: `バックアップファイルをダウンロードしました: ${filename}`,
      });
    } catch (error) {
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : 'エクスポートに失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Database className="h-6 w-6" />
          バックアップ・エクスポート
        </h1>
        <p className="text-muted-foreground">
          データのバックアップとエクスポートを管理します
        </p>
      </div>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            データエクスポート
          </CardTitle>
          <CardDescription>
            組織のデータをダウンロードしてバックアップを作成します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-3">
            <Label>エクスポート範囲</Label>
            <RadioGroup value={category} onValueChange={setCategory}>
              {EXPORT_CATEGORIES.map(cat => (
                <div key={cat.value} className="flex items-start space-x-3">
                  <RadioGroupItem value={cat.value} id={cat.value} className="mt-1" />
                  <div>
                    <Label htmlFor={cat.value} className="font-medium cursor-pointer">
                      {cat.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{cat.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <Label>フォーマット</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPORT_FORMATS.map(fmt => (
                  <SelectItem key={fmt.value} value={fmt.value}>
                    <div className="flex items-center gap-2">
                      <fmt.icon className="h-4 w-4" />
                      {fmt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>注意</AlertTitle>
            <AlertDescription>
              エクスポートには数分かかる場合があります。大量のデータがある場合は、
              カテゴリを絞ってエクスポートすることをお勧めします。
            </AlertDescription>
          </Alert>

          <Button onClick={handleExport} disabled={isExporting} size="lg">
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                エクスポート中...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                エクスポートを開始
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            データインポート
          </CardTitle>
          <CardDescription>
            バックアップファイルからデータを復元します
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>準備中</AlertTitle>
            <AlertDescription>
              データインポート機能は現在開発中です。
              データの復元が必要な場合は、サポートまでお問い合わせください。
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            エクスポート履歴
          </CardTitle>
          <CardDescription>
            過去のエクスポート履歴を確認できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          {backupHistory.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              エクスポート履歴がありません
            </p>
          ) : (
            <div className="space-y-3">
              {backupHistory.map(backup => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {backup.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">
                        {EXPORT_CATEGORIES.find(c => c.value === backup.category)?.label || backup.category}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(backup.date).toLocaleString('ja-JP')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{backup.format.toUpperCase()}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatFileSize(backup.size)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduled Backups Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            自動バックアップ
          </CardTitle>
          <CardDescription>
            定期的な自動バックアップの設定
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Database className="h-4 w-4" />
            <AlertTitle>Enterpriseプラン</AlertTitle>
            <AlertDescription>
              自動バックアップ機能はEnterpriseプランで利用可能です。
              毎日の自動バックアップ、長期保存、ポイントインタイムリカバリなどの機能が含まれます。
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
