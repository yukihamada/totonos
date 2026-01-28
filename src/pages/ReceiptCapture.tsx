import { useState, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Camera,
  Upload,
  FileText,
  Zap,
  Check,
  AlertTriangle,
  Calendar,
  DollarSign,
  Tag,
  Loader2,
  Trash2,
  Edit,
  Save,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OCRResult {
  id: string;
  imageUrl: string;
  status: 'processing' | 'completed' | 'error';
  extractedData?: {
    vendor: string;
    date: string;
    amount: number;
    taxAmount: number;
    category: string;
    description: string;
    confidence: number;
  };
  error?: string;
}

const categories = [
  { value: 'transportation', label: '交通費' },
  { value: 'meals', label: '会議費・接待費' },
  { value: 'supplies', label: '消耗品費' },
  { value: 'communication', label: '通信費' },
  { value: 'utilities', label: '水道光熱費' },
  { value: 'other', label: 'その他' },
];

// Map API category to our categories
function mapCategory(category: string | null): string {
  if (!category) return 'other';
  const mapping: Record<string, string> = {
    '交通費': 'transportation',
    '飲食費': 'meals',
    '消耗品': 'supplies',
    '通信費': 'communication',
    'その他': 'other',
  };
  return mapping[category] || 'other';
}

// Real OCR processing using edge function
async function processOCR(imageBase64: string): Promise<OCRResult['extractedData']> {
  const { data, error } = await supabase.functions.invoke('ocr-receipt', {
    body: {
      imageBase64,
      saveToDb: true,
      applyLegalTimestamp: true,
    },
  });

  if (error) {
    throw new Error(error.message || 'OCR処理に失敗しました');
  }

  const result = data?.result;
  if (!result) {
    throw new Error('OCR結果が取得できませんでした');
  }

  return {
    vendor: result.vendor || '不明',
    date: result.date || new Date().toISOString().split('T')[0],
    amount: result.total || 0,
    taxAmount: result.taxAmount || 0,
    category: mapCategory(result.category),
    description: 'OCRで自動読み取り',
    confidence: result.confidence || 0,
  };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
}

function ReceiptCard({ result, onDelete, onSave }: {
  result: OCRResult;
  onDelete: () => void;
  onSave: (data: OCRResult['extractedData']) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(result.extractedData);

  if (result.status === 'processing') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">OCR処理中...</p>
              <p className="text-sm text-muted-foreground">
                レシートを解析しています
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (result.status === 'error') {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <p className="font-medium text-red-600">読み取りエラー</p>
              <p className="text-sm text-muted-foreground">{result.error}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={onDelete}>
                削除
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = isEditing ? editData : result.extractedData;
  if (!data) return null;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            <img src={result.imageUrl} alt="Receipt" className="object-cover w-full h-full" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <Input
                      value={editData?.vendor}
                      onChange={(e) => setEditData(prev => prev ? { ...prev, vendor: e.target.value } : prev)}
                      className="font-medium"
                    />
                  ) : (
                    <p className="font-medium">{data.vendor}</p>
                  )}
                  <Badge variant="outline" className={data.confidence > 0.9 ? 'text-green-600' : 'text-yellow-600'}>
                    {Math.round(data.confidence * 100)}% 信頼度
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                      キャンセル
                    </Button>
                    <Button size="sm" onClick={() => {
                      if (editData) onSave(editData);
                      setIsEditing(false);
                    }}>
                      <Save className="h-4 w-4 mr-1" />
                      保存
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => {
                      setEditData(result.extractedData);
                      setIsEditing(true);
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onDelete}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {isEditing ? (
                  <Input
                    type="date"
                    value={editData?.date}
                    onChange={(e) => setEditData(prev => prev ? { ...prev, date: e.target.value } : prev)}
                  />
                ) : (
                  <span>{data.date}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {isEditing ? (
                  <Select
                    value={editData?.category}
                    onValueChange={(v) => setEditData(prev => prev ? { ...prev, category: v } : prev)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span>{categories.find(c => c.value === data.category)?.label}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                {isEditing ? (
                  <Input
                    type="number"
                    value={editData?.amount}
                    onChange={(e) => setEditData(prev => prev ? { ...prev, amount: Number(e.target.value) } : prev)}
                  />
                ) : (
                  <span className="font-medium">{formatCurrency(data.amount)}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>税額: {formatCurrency(data.taxAmount)}</span>
              </div>
            </div>

            {!isEditing && (
              <Button className="w-full mt-2" variant="outline">
                <Check className="h-4 w-4 mr-2" />
                経費申請に追加
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReceiptCapture() {
  const [results, setResults] = useState<OCRResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imageUrl = URL.createObjectURL(file);
      const id = `receipt-${Date.now()}-${i}`;

      // Add processing result
      setResults(prev => [...prev, {
        id,
        imageUrl,
        status: 'processing',
      }]);

      // Process with real OCR
      try {
        const base64 = await fileToBase64(file);
        const extractedData = await processOCR(base64);
        setResults(prev => prev.map(r =>
          r.id === id ? { ...r, status: 'completed', extractedData } : r
        ));
        
        toast({
          title: 'OCR処理完了',
          description: extractedData.vendor 
            ? `${extractedData.vendor} - ¥${extractedData.amount.toLocaleString()}`
            : 'レシート情報を抽出しました',
        });
      } catch (error) {
        console.error('OCR error:', error);
        setResults(prev => prev.map(r =>
          r.id === id ? { 
            ...r, 
            status: 'error', 
            error: error instanceof Error ? error.message : '読み取りに失敗しました' 
          } : r
        ));
        
        toast({
          title: 'OCRエラー',
          description: error instanceof Error ? error.message : '読み取りに失敗しました',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDelete = (id: string) => {
    setResults(prev => prev.filter(r => r.id !== id));
  };

  const handleSave = (id: string, data: OCRResult['extractedData']) => {
    setResults(prev => prev.map(r =>
      r.id === id ? { ...r, extractedData: data } : r
    ));
  };

  const completedResults = results.filter(r => r.status === 'completed');
  const totalAmount = completedResults.reduce((sum, r) => sum + (r.extractedData?.amount || 0), 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Camera className="h-8 w-8" />
              レシートOCR
            </h1>
            <p className="text-muted-foreground">
              レシートを撮影・アップロードして自動で経費データを作成
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>読み取り済み</CardDescription>
              <CardTitle className="text-2xl">{completedResults.length}枚</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>合計金額</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(totalAmount)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>処理中</CardDescription>
              <CardTitle className="text-2xl">{results.filter(r => r.status === 'processing').length}枚</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              レシートをアップロード
            </CardTitle>
            <CardDescription>
              画像をドラッグ&ドロップ、またはクリックしてファイルを選択
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileUpload(e.dataTransfer.files);
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">レシート画像をアップロード</p>
              <p className="text-sm text-muted-foreground">
                JPEG, PNG, HEIC形式に対応・複数ファイル選択可
              </p>
              <div className="flex justify-center gap-4 mt-4">
                <Button variant="outline">
                  <Camera className="h-4 w-4 mr-2" />
                  カメラで撮影
                </Button>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  ファイルを選択
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                読み取り結果
              </h2>
              {completedResults.length > 0 && (
                <Button>
                  <Zap className="h-4 w-4 mr-2" />
                  一括で経費申請
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {results.map(result => (
                <ReceiptCard
                  key={result.id}
                  result={result}
                  onDelete={() => handleDelete(result.id)}
                  onSave={(data) => handleSave(result.id, data)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle>撮影のコツ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">明るい場所で</p>
                  <p className="text-sm text-muted-foreground">
                    十分な明るさがあると読み取り精度が向上します
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">平らに置く</p>
                  <p className="text-sm text-muted-foreground">
                    レシートをしわなく平らに広げてください
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">全体を撮影</p>
                  <p className="text-sm text-muted-foreground">
                    日付・金額・店名が含まれるように撮影
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
