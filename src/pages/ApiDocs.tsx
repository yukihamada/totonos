import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';
import {
  Book,
  Copy,
  ArrowLeft,
  FileJson,
  Users,
  Receipt,
  FileText,
  Briefcase,
  Building,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
  response: string;
}

interface ApiGroup {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  endpoints: Endpoint[];
}

const apiGroups: ApiGroup[] = [
  {
    id: 'invoices',
    name: '請求書',
    icon: <Receipt className="h-5 w-5" />,
    description: '請求書の作成・取得・更新',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/invoices',
        description: '請求書一覧を取得',
        params: [
          { name: 'status', type: 'string', required: false, description: 'フィルタ: draft, sent, paid, overdue' },
          { name: 'limit', type: 'number', required: false, description: '取得件数（デフォルト: 50）' },
          { name: 'offset', type: 'number', required: false, description: 'オフセット' },
        ],
        response: `{
  "data": [
    {
      "id": "inv_abc123",
      "number": "INV-2025-001",
      "client_name": "株式会社サンプル",
      "amount": 100000,
      "status": "sent",
      "due_date": "2025-02-28",
      "created_at": "2025-01-15T10:00:00Z"
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}`,
      },
      {
        method: 'GET',
        path: '/api/v1/invoices/:id',
        description: '請求書詳細を取得',
        response: `{
  "id": "inv_abc123",
  "number": "INV-2025-001",
  "client_name": "株式会社サンプル",
  "client_email": "info@sample.co.jp",
  "items": [
    { "name": "コンサルティング", "quantity": 10, "unit_price": 10000, "amount": 100000 }
  ],
  "subtotal": 100000,
  "tax": 10000,
  "total": 110000,
  "status": "sent",
  "due_date": "2025-02-28"
}`,
      },
      {
        method: 'POST',
        path: '/api/v1/invoices',
        description: '請求書を作成',
        params: [
          { name: 'client_name', type: 'string', required: true, description: '取引先名' },
          { name: 'client_email', type: 'string', required: true, description: 'メールアドレス' },
          { name: 'items', type: 'array', required: true, description: '明細項目' },
          { name: 'due_date', type: 'string', required: true, description: '支払期限 (YYYY-MM-DD)' },
        ],
        response: `{
  "id": "inv_xyz789",
  "number": "INV-2025-002",
  "status": "draft"
}`,
      },
    ],
  },
  {
    id: 'contracts',
    name: '契約書',
    icon: <FileText className="h-5 w-5" />,
    description: '契約書の作成・取得・署名',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/contracts',
        description: '契約書一覧を取得',
        params: [
          { name: 'status', type: 'string', required: false, description: 'フィルタ: draft, pending, signed, expired' },
        ],
        response: `{
  "data": [
    {
      "id": "con_abc123",
      "title": "業務委託契約書",
      "partner": "株式会社サンプル",
      "status": "signed",
      "signed_at": "2025-01-10T14:00:00Z"
    }
  ],
  "total": 50
}`,
      },
      {
        method: 'POST',
        path: '/api/v1/contracts',
        description: '契約書を作成',
        params: [
          { name: 'title', type: 'string', required: true, description: '契約タイトル' },
          { name: 'partner', type: 'string', required: true, description: '契約相手' },
          { name: 'content', type: 'string', required: true, description: '契約内容（Markdown）' },
        ],
        response: `{
  "id": "con_xyz789",
  "status": "draft",
  "sign_url": "https://..."
}`,
      },
    ],
  },
  {
    id: 'leads',
    name: 'リード',
    icon: <Users className="h-5 w-5" />,
    description: 'リードの管理とスコアリング',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/leads',
        description: 'リード一覧を取得',
        params: [
          { name: 'status', type: 'string', required: false, description: 'フィルタ: new, contacted, qualified, lost' },
          { name: 'source', type: 'string', required: false, description: '流入元' },
        ],
        response: `{
  "data": [
    {
      "id": "lead_abc123",
      "name": "山田太郎",
      "email": "yamada@example.com",
      "company": "株式会社サンプル",
      "status": "qualified",
      "score": 85,
      "created_at": "2025-01-01T09:00:00Z"
    }
  ],
  "total": 200
}`,
      },
      {
        method: 'POST',
        path: '/api/v1/leads',
        description: 'リードを作成',
        params: [
          { name: 'name', type: 'string', required: true, description: '名前' },
          { name: 'email', type: 'string', required: true, description: 'メールアドレス' },
          { name: 'company', type: 'string', required: false, description: '会社名' },
          { name: 'source', type: 'string', required: false, description: '流入元' },
        ],
        response: `{
  "id": "lead_xyz789",
  "score": 50
}`,
      },
    ],
  },
  {
    id: 'employees',
    name: '従業員',
    icon: <Briefcase className="h-5 w-5" />,
    description: '従業員情報の取得',
    endpoints: [
      {
        method: 'GET',
        path: '/api/v1/employees',
        description: '従業員一覧を取得',
        params: [
          { name: 'department', type: 'string', required: false, description: '部署でフィルタ' },
          { name: 'status', type: 'string', required: false, description: 'active, inactive' },
        ],
        response: `{
  "data": [
    {
      "id": "emp_abc123",
      "name": "佐藤花子",
      "email": "sato@company.co.jp",
      "department": "営業部",
      "position": "マネージャー",
      "joined_at": "2020-04-01"
    }
  ],
  "total": 50
}`,
      },
    ],
  },
];

export default function ApiDocs() {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('コピーしました');
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'POST': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'PUT': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/developer">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  戻る
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Book className="h-8 w-8" />
              API ドキュメント
            </h1>
            <p className="text-muted-foreground">
              Totonos REST APIの使い方
            </p>
          </div>
        </div>

        {/* 認証 */}
        <Card>
          <CardHeader>
            <CardTitle>認証</CardTitle>
            <CardDescription>すべてのリクエストにはAPI Keyが必要です</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm mb-2">リクエストヘッダーに以下を含めてください：</p>
              <div className="flex items-center gap-2">
                <pre className="flex-1 p-3 bg-muted rounded-lg text-sm">
                  Authorization: Bearer ttn_your_api_key
                </pre>
                <Button variant="outline" size="icon" onClick={() => handleCopy('Authorization: Bearer ttn_your_api_key')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                API Keyは<Link to="/developer" className="underline">開発者設定</Link>で作成できます
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ベースURL */}
        <Card>
          <CardHeader>
            <CardTitle>ベースURL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <pre className="flex-1 p-3 bg-muted rounded-lg text-sm">
                https://your-project.supabase.co/functions/v1
              </pre>
              <Button variant="outline" size="icon" onClick={() => handleCopy('https://your-project.supabase.co/functions/v1')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* エンドポイント */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              エンドポイント
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={apiGroups[0].id}>
              <TabsList className="mb-4 flex-wrap h-auto">
                {apiGroups.map((group) => (
                  <TabsTrigger key={group.id} value={group.id} className="gap-2">
                    {group.icon}
                    {group.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {apiGroups.map((group) => (
                <TabsContent key={group.id} value={group.id} className="space-y-4">
                  <p className="text-muted-foreground">{group.description}</p>

                  <Accordion type="multiple" className="space-y-2">
                    {group.endpoints.map((endpoint, index) => (
                      <AccordionItem
                        key={index}
                        value={`${group.id}-${index}`}
                        className="border rounded-lg px-4"
                      >
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <Badge className={getMethodColor(endpoint.method)}>
                              {endpoint.method}
                            </Badge>
                            <code className="text-sm">{endpoint.path}</code>
                            <span className="text-muted-foreground text-sm">
                              {endpoint.description}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          {endpoint.params && endpoint.params.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">パラメータ</h4>
                              <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead className="bg-muted">
                                    <tr>
                                      <th className="text-left p-2">名前</th>
                                      <th className="text-left p-2">型</th>
                                      <th className="text-left p-2">必須</th>
                                      <th className="text-left p-2">説明</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {endpoint.params.map((param, pIndex) => (
                                      <tr key={pIndex} className="border-t">
                                        <td className="p-2"><code>{param.name}</code></td>
                                        <td className="p-2 text-muted-foreground">{param.type}</td>
                                        <td className="p-2">
                                          {param.required ? (
                                            <Badge variant="destructive" className="text-xs">必須</Badge>
                                          ) : (
                                            <Badge variant="secondary" className="text-xs">任意</Badge>
                                          )}
                                        </td>
                                        <td className="p-2 text-muted-foreground">{param.description}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">レスポンス例</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(endpoint.response)}
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                コピー
                              </Button>
                            </div>
                            <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                              {endpoint.response}
                            </pre>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* エラーコード */}
        <Card>
          <CardHeader>
            <CardTitle>エラーコード</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3">コード</th>
                    <th className="text-left p-3">説明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3"><code>400</code></td>
                    <td className="p-3 text-muted-foreground">リクエストが不正です</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3"><code>401</code></td>
                    <td className="p-3 text-muted-foreground">認証に失敗しました（API Keyが無効）</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3"><code>403</code></td>
                    <td className="p-3 text-muted-foreground">アクセス権限がありません</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3"><code>404</code></td>
                    <td className="p-3 text-muted-foreground">リソースが見つかりません</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3"><code>429</code></td>
                    <td className="p-3 text-muted-foreground">レート制限を超えました</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3"><code>500</code></td>
                    <td className="p-3 text-muted-foreground">サーバーエラー</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
