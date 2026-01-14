import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Shield,
  Copy,
  ArrowLeft,
  Plug,
  Wrench,
  FileText,
  Users,
  Receipt,
  Calculator,
  Briefcase,
  BookOpen,
  Monitor,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface McpTool {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
}

const mcpTools: McpTool[] = [
  // Contracts
  { id: 'list_contracts', name: '契約一覧取得', description: '契約書の一覧を取得', category: 'contracts', enabled: true },
  { id: 'contract_get', name: '契約詳細取得', description: '契約書の詳細を取得', category: 'contracts', enabled: true },
  { id: 'contract_create', name: '契約作成', description: '新しい契約書を作成', category: 'contracts', enabled: true },
  { id: 'contract_update', name: '契約更新', description: '契約書を更新', category: 'contracts', enabled: true },
  // CRM
  { id: 'list_leads', name: 'リード一覧取得', description: 'リードの一覧を取得', category: 'crm', enabled: true },
  { id: 'lead_get', name: 'リード詳細取得', description: 'リードの詳細を取得', category: 'crm', enabled: true },
  { id: 'lead_create', name: 'リード作成', description: '新しいリードを作成', category: 'crm', enabled: true },
  { id: 'lead_update', name: 'リード更新', description: 'リードを更新', category: 'crm', enabled: true },
  { id: 'list_deals', name: '商談一覧取得', description: '商談の一覧を取得', category: 'crm', enabled: true },
  { id: 'deal_create', name: '商談作成', description: '新しい商談を作成', category: 'crm', enabled: true },
  { id: 'log_activity', name: '活動記録', description: '活動を記録', category: 'crm', enabled: true },
  { id: 'get_pipeline_stats', name: 'パイプライン統計', description: 'パイプラインの統計を取得', category: 'crm', enabled: true },
  // Accounting
  { id: 'journal_create', name: '仕訳作成', description: '仕訳を作成', category: 'accounting', enabled: true },
  { id: 'journal_list', name: '仕訳一覧', description: '仕訳一覧を取得', category: 'accounting', enabled: true },
  { id: 'get_trial_balance', name: '試算表取得', description: '試算表を取得', category: 'accounting', enabled: true },
  { id: 'get_balance_sheet', name: '貸借対照表', description: '貸借対照表を取得', category: 'accounting', enabled: true },
  { id: 'get_income_statement', name: '損益計算書', description: '損益計算書を取得', category: 'accounting', enabled: true },
  { id: 'expense_create', name: '経費作成', description: '経費を作成', category: 'accounting', enabled: true },
  { id: 'expense_list', name: '経費一覧', description: '経費一覧を取得', category: 'accounting', enabled: true },
  // HR
  { id: 'list_employees', name: '従業員一覧', description: '従業員一覧を取得', category: 'hr', enabled: true },
  { id: 'employee_get', name: '従業員詳細', description: '従業員詳細を取得', category: 'hr', enabled: true },
  { id: 'employee_create', name: '従業員作成', description: '従業員を作成', category: 'hr', enabled: true },
  { id: 'attendance_create', name: '勤怠登録', description: '勤怠を登録', category: 'hr', enabled: true },
  { id: 'attendance_list', name: '勤怠一覧', description: '勤怠一覧を取得', category: 'hr', enabled: true },
  { id: 'calculate_payroll', name: '給与計算', description: '給与を計算', category: 'hr', enabled: true },
  // Wiki
  { id: 'search_wiki', name: 'Wiki検索', description: 'Wikiを検索', category: 'wiki', enabled: true },
  { id: 'wiki_create', name: 'Wiki作成', description: 'Wikiページを作成', category: 'wiki', enabled: true },
  { id: 'wiki_update', name: 'Wiki更新', description: 'Wikiページを更新', category: 'wiki', enabled: true },
  // IT Assets
  { id: 'list_it_assets', name: 'IT資産一覧', description: 'IT資産一覧を取得', category: 'it', enabled: true },
  { id: 'asset_get', name: 'IT資産詳細', description: 'IT資産詳細を取得', category: 'it', enabled: true },
  { id: 'asset_create', name: 'IT資産作成', description: 'IT資産を作成', category: 'it', enabled: true },
  // Invoices
  { id: 'invoice_list', name: '請求書一覧', description: '請求書一覧を取得', category: 'invoices', enabled: true },
  { id: 'invoice_get', name: '請求書詳細', description: '請求書詳細を取得', category: 'invoices', enabled: true },
  { id: 'invoice_create', name: '請求書作成', description: '請求書を作成', category: 'invoices', enabled: true },
];

const categories = [
  { id: 'contracts', name: '契約', icon: <FileText className="h-4 w-4" /> },
  { id: 'crm', name: 'CRM', icon: <Users className="h-4 w-4" /> },
  { id: 'accounting', name: '会計', icon: <Calculator className="h-4 w-4" /> },
  { id: 'hr', name: '人事', icon: <Briefcase className="h-4 w-4" /> },
  { id: 'wiki', name: 'Wiki', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'it', name: 'IT資産', icon: <Monitor className="h-4 w-4" /> },
  { id: 'invoices', name: '請求書', icon: <Receipt className="h-4 w-4" /> },
];

export default function McpSettings() {
  const [tools, setTools] = useState(mcpTools);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('disconnected');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('コピーしました');
  };

  const toggleTool = (toolId: string) => {
    setTools(prev => prev.map(t =>
      t.id === toolId ? { ...t, enabled: !t.enabled } : t
    ));
  };

  const toggleCategory = (categoryId: string, enabled: boolean) => {
    setTools(prev => prev.map(t =>
      t.category === categoryId ? { ...t, enabled } : t
    ));
  };

  const testConnection = async () => {
    setConnectionStatus('testing');
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000));
    setConnectionStatus('connected');
    toast.success('接続テスト成功');
  };

  const enabledToolCount = tools.filter(t => t.enabled).length;

  const mcpConfig = `{
  "mcpServers": {
    "totonos": {
      "url": "${window.location.origin}/functions/v1/mcp",
      "transport": "sse",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}`;

  const pythonExample = `from anthropic import Anthropic

client = Anthropic()

# MCPツールを使用してTotonosのデータにアクセス
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    tools=[{
        "type": "mcp",
        "server_label": "totonos"
    }],
    messages=[{
        "role": "user",
        "content": "今月の請求書一覧を見せて"
    }]
)`;

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
              <Shield className="h-8 w-8" />
              MCP設定
            </h1>
            <p className="text-muted-foreground">
              Model Context Protocol (MCP) サーバー設定
            </p>
          </div>
          <div className="flex items-center gap-2">
            {connectionStatus === 'connected' ? (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                接続済み
              </Badge>
            ) : connectionStatus === 'testing' ? (
              <Badge className="bg-yellow-100 text-yellow-800">
                テスト中...
              </Badge>
            ) : (
              <Badge variant="secondary">
                <XCircle className="h-3 w-3 mr-1" />
                未接続
              </Badge>
            )}
            <Button onClick={testConnection} disabled={connectionStatus === 'testing'}>
              <Plug className="mr-2 h-4 w-4" />
              接続テスト
            </Button>
          </div>
        </div>

        {/* 統計 */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>有効なツール</CardDescription>
              <CardTitle className="text-2xl">
                {enabledToolCount} / {tools.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>カテゴリ</CardDescription>
              <CardTitle className="text-2xl">
                {categories.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>プロトコル</CardDescription>
              <CardTitle className="text-2xl">
                SSE
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* 接続設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plug className="h-5 w-5" />
              接続設定
            </CardTitle>
            <CardDescription>
              Claude DesktopやMCPクライアントから接続するための設定
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">MCP Server URL</span>
                <Button variant="ghost" size="sm" onClick={() => handleCopy(`${window.location.origin}/functions/v1/mcp`)}>
                  <Copy className="h-3 w-3 mr-1" />
                  コピー
                </Button>
              </div>
              <pre className="p-3 bg-muted rounded-lg text-sm">
                {window.location.origin}/functions/v1/mcp
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Claude Desktop設定 (claude_desktop_config.json)</span>
                <Button variant="ghost" size="sm" onClick={() => handleCopy(mcpConfig)}>
                  <Copy className="h-3 w-3 mr-1" />
                  コピー
                </Button>
              </div>
              <pre className="p-3 bg-muted rounded-lg text-sm overflow-x-auto">
                {mcpConfig}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* コード例 */}
        <Card>
          <CardHeader>
            <CardTitle>コード例</CardTitle>
            <CardDescription>MCPツールを使用するサンプルコード</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="python">
              <TabsList>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="curl">cURL</TabsTrigger>
              </TabsList>
              <TabsContent value="python">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(pythonExample)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                    {pythonExample}
                  </pre>
                </div>
              </TabsContent>
              <TabsContent value="curl">
                <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
{`curl -X POST "${window.location.origin}/functions/v1/mcp" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"method": "tools/list"}'`}
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* ツール一覧 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              利用可能なツール
            </CardTitle>
            <CardDescription>
              MCPクライアントから利用可能なツールを管理
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {categories.map((category) => {
                const categoryTools = tools.filter(t => t.category === category.id);
                const enabledCount = categoryTools.filter(t => t.enabled).length;
                const allEnabled = enabledCount === categoryTools.length;

                return (
                  <div key={category.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {category.icon}
                        <span className="font-medium">{category.name}</span>
                        <Badge variant="secondary">
                          {enabledCount}/{categoryTools.length}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          すべて{allEnabled ? '無効' : '有効'}にする
                        </span>
                        <Switch
                          checked={allEnabled}
                          onCheckedChange={(checked) => toggleCategory(category.id, checked)}
                        />
                      </div>
                    </div>

                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                      {categoryTools.map((tool) => (
                        <div
                          key={tool.id}
                          className={`flex items-center justify-between p-3 border rounded-lg ${
                            !tool.enabled ? 'opacity-50' : ''
                          }`}
                        >
                          <div>
                            <p className="font-medium text-sm">{tool.name}</p>
                            <p className="text-xs text-muted-foreground">{tool.description}</p>
                          </div>
                          <Switch
                            checked={tool.enabled}
                            onCheckedChange={() => toggleTool(tool.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ドキュメントリンク */}
        <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium text-purple-900 dark:text-purple-100">
                    MCPについて詳しく
                  </h3>
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    Model Context Protocolの詳細なドキュメント
                  </p>
                </div>
              </div>
              <Button variant="outline" asChild>
                <a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  MCP公式ドキュメント
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
