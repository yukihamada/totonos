import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Shield,
  FileText,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Upload,
  Download,
  Stamp,
  Building2,
  DollarSign,
  Eye,
  Settings,
  Info,
} from 'lucide-react';

interface ElectronicDocument {
  id: string;
  type: 'invoice' | 'receipt' | 'contract' | 'estimate';
  documentNumber: string;
  documentName: string;
  vendor: string;
  amount: number;
  documentDate: string;
  receivedDate: string;
  timestampedAt?: string;
  hasTimestamp: boolean;
  retentionPeriod: number; // years
  expiresAt: string;
  searchKeywords: string[];
  status: 'compliant' | 'pending' | 'expired';
}

// Mock documents
const mockDocuments: ElectronicDocument[] = [
  {
    id: '1',
    type: 'invoice',
    documentNumber: 'INV-2026-001',
    documentName: '請求書_ABC商事_202601',
    vendor: '株式会社ABC商事',
    amount: 550000,
    documentDate: '2026-01-10',
    receivedDate: '2026-01-11',
    timestampedAt: '2026-01-11T10:30:00',
    hasTimestamp: true,
    retentionPeriod: 7,
    expiresAt: '2033-01-11',
    searchKeywords: ['ABC商事', '請求書', '550000', '2026-01'],
    status: 'compliant',
  },
  {
    id: '2',
    type: 'receipt',
    documentNumber: 'RCP-2026-015',
    documentName: '領収書_経費精算_田中',
    vendor: 'タクシー株式会社',
    amount: 3500,
    documentDate: '2026-01-08',
    receivedDate: '2026-01-09',
    timestampedAt: '2026-01-09T14:20:00',
    hasTimestamp: true,
    retentionPeriod: 7,
    expiresAt: '2033-01-09',
    searchKeywords: ['タクシー', '領収書', '3500', '経費'],
    status: 'compliant',
  },
  {
    id: '3',
    type: 'contract',
    documentNumber: 'CON-2026-003',
    documentName: '業務委託契約書_DEF社',
    vendor: 'DEF株式会社',
    amount: 1200000,
    documentDate: '2026-01-05',
    receivedDate: '2026-01-06',
    hasTimestamp: false,
    retentionPeriod: 10,
    expiresAt: '2036-01-06',
    searchKeywords: ['DEF', '業務委託', '契約書', '1200000'],
    status: 'pending',
  },
  {
    id: '4',
    type: 'estimate',
    documentNumber: 'EST-2026-008',
    documentName: '見積書_GHI工業',
    vendor: 'GHI工業株式会社',
    amount: 850000,
    documentDate: '2026-01-03',
    receivedDate: '2026-01-04',
    timestampedAt: '2026-01-04T09:15:00',
    hasTimestamp: true,
    retentionPeriod: 7,
    expiresAt: '2033-01-04',
    searchKeywords: ['GHI工業', '見積書', '850000'],
    status: 'compliant',
  },
];

const documentTypeLabels: Record<string, string> = {
  invoice: '請求書',
  receipt: '領収書',
  contract: '契約書',
  estimate: '見積書',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
}

function StatusBadge({ status }: { status: ElectronicDocument['status'] }) {
  const config = {
    compliant: { label: '適格', variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
    pending: { label: '未対応', variant: 'secondary' as const, icon: AlertTriangle, color: 'text-yellow-600' },
    expired: { label: '期限切れ', variant: 'destructive' as const, icon: AlertTriangle, color: 'text-red-600' },
  };
  const c = config[status];
  const Icon = c.icon;
  return (
    <Badge variant={c.variant} className={c.color}>
      <Icon className="h-3 w-3 mr-1" />
      {c.label}
    </Badge>
  );
}

export default function EBookkeeping() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

  const filteredDocs = mockDocuments.filter(doc => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return doc.searchKeywords.some(kw => kw.toLowerCase().includes(query)) ||
      doc.documentName.toLowerCase().includes(query) ||
      doc.vendor.toLowerCase().includes(query);
  });

  const stats = {
    total: mockDocuments.length,
    compliant: mockDocuments.filter(d => d.status === 'compliant').length,
    pending: mockDocuments.filter(d => d.status === 'pending').length,
    timestamped: mockDocuments.filter(d => d.hasTimestamp).length,
  };

  const toggleSelect = (id: string) => {
    setSelectedDocs(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkTimestamp = () => {
    alert(`${selectedDocs.length}件のドキュメントにタイムスタンプを付与します`);
    setSelectedDocs([]);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8" />
              電子帳簿保存法対応
            </h1>
            <p className="text-muted-foreground">
              電子取引データの保存・検索要件への対応
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              設定
            </Button>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              ドキュメント登録
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>登録ドキュメント</CardDescription>
              <CardTitle className="text-2xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className={stats.compliant === stats.total ? 'border-green-500' : ''}>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                適格保存
              </CardDescription>
              <CardTitle className="text-2xl text-green-600">{stats.compliant}</CardTitle>
            </CardHeader>
          </Card>
          <Card className={stats.pending > 0 ? 'border-yellow-500' : ''}>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                要対応
              </CardDescription>
              <CardTitle className="text-2xl text-yellow-600">{stats.pending}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Stamp className="h-4 w-4" />
                タイムスタンプ済
              </CardDescription>
              <CardTitle className="text-2xl">{stats.timestamped}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Info Banner */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">電子帳簿保存法について</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  2024年1月より、電子取引データの電子保存が義務化されています。
                  取引先名・日付・金額での検索ができることが要件となります。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="documents">
          <TabsList>
            <TabsTrigger value="documents">ドキュメント一覧</TabsTrigger>
            <TabsTrigger value="search">検索要件</TabsTrigger>
            <TabsTrigger value="retention">保存期間管理</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-4">
            {/* Search & Actions */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="取引先名、日付、金額で検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  {selectedDocs.length > 0 && (
                    <Button onClick={handleBulkTimestamp}>
                      <Stamp className="h-4 w-4 mr-2" />
                      一括タイムスタンプ ({selectedDocs.length}件)
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Documents Table */}
            <Card>
              <CardHeader>
                <CardTitle>電子取引データ一覧</CardTitle>
                <CardDescription>{filteredDocs.length}件のドキュメント</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={selectedDocs.length === filteredDocs.length && filteredDocs.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedDocs(filteredDocs.map(d => d.id));
                            } else {
                              setSelectedDocs([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>種類</TableHead>
                      <TableHead>ドキュメント名</TableHead>
                      <TableHead>取引先</TableHead>
                      <TableHead className="text-right">金額</TableHead>
                      <TableHead>取引日</TableHead>
                      <TableHead>タイムスタンプ</TableHead>
                      <TableHead>保存期限</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocs.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedDocs.includes(doc.id)}
                            onCheckedChange={() => toggleSelect(doc.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {documentTypeLabels[doc.type]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{doc.documentName}</p>
                            <p className="text-xs text-muted-foreground">{doc.documentNumber}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            {doc.vendor}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(doc.amount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {doc.documentDate}
                          </div>
                        </TableCell>
                        <TableCell>
                          {doc.hasTimestamp ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <Stamp className="h-3 w-3" />
                              <span className="text-xs">{doc.timestampedAt?.split('T')[0]}</span>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-yellow-600">
                              未付与
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {doc.expiresAt}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={doc.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>検索要件への対応状況</CardTitle>
                <CardDescription>
                  電子帳簿保存法で求められる検索機能
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-lg border">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium">取引年月日での検索</p>
                      <p className="text-sm text-muted-foreground">日付範囲を指定して検索可能</p>
                    </div>
                    <Badge className="ml-auto bg-green-100 text-green-800">対応済み</Badge>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-lg border">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium">取引金額での検索</p>
                      <p className="text-sm text-muted-foreground">金額範囲を指定して検索可能</p>
                    </div>
                    <Badge className="ml-auto bg-green-100 text-green-800">対応済み</Badge>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-lg border">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium">取引先での検索</p>
                      <p className="text-sm text-muted-foreground">取引先名で検索可能</p>
                    </div>
                    <Badge className="ml-auto bg-green-100 text-green-800">対応済み</Badge>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-lg border">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium">複合条件での検索</p>
                      <p className="text-sm text-muted-foreground">2つ以上の条件を組み合わせて検索可能</p>
                    </div>
                    <Badge className="ml-auto bg-green-100 text-green-800">対応済み</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="retention" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>保存期間管理</CardTitle>
                <CardDescription>
                  法定保存期間と期限管理
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="h-5 w-5" />
                      <span className="font-medium">請求書・領収書</span>
                    </div>
                    <p className="text-2xl font-bold">7年間</p>
                    <p className="text-sm text-muted-foreground">
                      法人税法に基づく保存期間
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="h-5 w-5" />
                      <span className="font-medium">契約書</span>
                    </div>
                    <p className="text-2xl font-bold">10年間</p>
                    <p className="text-sm text-muted-foreground">
                      商法に基づく保存期間
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
