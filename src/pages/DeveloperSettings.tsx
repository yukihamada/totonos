import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import {
  Key,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Code,
  Shield,
  Activity,
} from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  createdAt: Date;
  lastUsedAt: Date | null;
  requestCount: number;
}

const API_KEYS_STORAGE = 'totonos_api_keys';

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'ttn_';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

function loadApiKeys(): ApiKey[] {
  try {
    const stored = localStorage.getItem(API_KEYS_STORAGE);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((k: ApiKey) => ({
        ...k,
        createdAt: new Date(k.createdAt),
        lastUsedAt: k.lastUsedAt ? new Date(k.lastUsedAt) : null,
      }));
    }
  } catch {
    // ignore
  }
  return [];
}

function saveApiKeys(keys: ApiKey[]): void {
  localStorage.setItem(API_KEYS_STORAGE, JSON.stringify(keys));
}

export default function DeveloperSettings() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(loadApiKeys);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [deleteKeyId, setDeleteKeyId] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    saveApiKeys(apiKeys);
  }, [apiKeys]);

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast.error('API Key名を入力してください');
      return;
    }

    const key = generateApiKey();
    const newApiKey: ApiKey = {
      id: crypto.randomUUID(),
      name: newKeyName.trim(),
      key,
      prefix: key.slice(0, 8) + '...',
      createdAt: new Date(),
      lastUsedAt: null,
      requestCount: 0,
    };

    setApiKeys(prev => [...prev, newApiKey]);
    setNewlyCreatedKey(key);
    setNewKeyName('');
    toast.success('API Keyを作成しました');
  };

  const handleDeleteKey = () => {
    if (!deleteKeyId) return;
    setApiKeys(prev => prev.filter(k => k.id !== deleteKeyId));
    setDeleteKeyId(null);
    toast.success('API Keyを削除しました');
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('コピーしました');
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const next = new Set(prev);
      if (next.has(keyId)) {
        next.delete(keyId);
      } else {
        next.add(keyId);
      }
      return next;
    });
  };

  const maskKey = (key: string) => {
    return key.slice(0, 8) + '•'.repeat(24) + key.slice(-4);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Code className="h-8 w-8" />
              開発者設定
            </h1>
            <p className="text-muted-foreground">
              API KeyとMCP設定の管理
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/api-docs">
                <ExternalLink className="mr-2 h-4 w-4" />
                APIドキュメント
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/mcp-settings">
                <Shield className="mr-2 h-4 w-4" />
                MCP設定
              </Link>
            </Button>
          </div>
        </div>

        {/* 統計 */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>API Keys</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Key className="h-5 w-5" />
                {apiKeys.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>総リクエスト数</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {apiKeys.reduce((sum, k) => sum + k.requestCount, 0).toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>レート制限</CardDescription>
              <CardTitle className="text-2xl">
                1,000 req/min
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* API Keys */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Keys
                </CardTitle>
                <CardDescription>
                  外部システムからTotonosにアクセスするためのキー
                </CardDescription>
              </div>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                新規作成
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {apiKeys.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名前</TableHead>
                    <TableHead>API Key</TableHead>
                    <TableHead>作成日</TableHead>
                    <TableHead>最終使用</TableHead>
                    <TableHead>リクエスト数</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id}>
                      <TableCell className="font-medium">{apiKey.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                          >
                            {visibleKeys.has(apiKey.id) ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleCopyKey(apiKey.key)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(apiKey.createdAt, 'yyyy/MM/dd', { locale: ja })}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {apiKey.lastUsedAt
                          ? format(apiKey.lastUsedAt, 'yyyy/MM/dd HH:mm', { locale: ja })
                          : '未使用'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{apiKey.requestCount.toLocaleString()}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteKeyId(apiKey.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>API Keyがありません</p>
                <p className="text-sm">「新規作成」をクリックして最初のキーを作成してください</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* クイックスタート */}
        <Card>
          <CardHeader>
            <CardTitle>クイックスタート</CardTitle>
            <CardDescription>APIの使い方</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">基本的なリクエスト</Label>
              <pre className="mt-2 p-4 bg-muted rounded-lg text-sm overflow-x-auto">
{`curl -X GET "https://your-project.supabase.co/functions/v1/api/invoices" \\
  -H "Authorization: Bearer ttn_your_api_key" \\
  -H "Content-Type: application/json"`}
              </pre>
            </div>
            <div>
              <Label className="text-sm font-medium">利用可能なエンドポイント</Label>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <div className="p-3 bg-muted rounded-lg">
                  <code className="text-sm">GET /api/invoices</code>
                  <p className="text-xs text-muted-foreground mt-1">請求書一覧の取得</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <code className="text-sm">GET /api/contracts</code>
                  <p className="text-xs text-muted-foreground mt-1">契約書一覧の取得</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <code className="text-sm">GET /api/leads</code>
                  <p className="text-xs text-muted-foreground mt-1">リード一覧の取得</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <code className="text-sm">GET /api/employees</code>
                  <p className="text-xs text-muted-foreground mt-1">従業員一覧の取得</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 作成ダイアログ */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新しいAPI Keyを作成</DialogTitle>
              <DialogDescription>
                API Keyに名前をつけて管理できます
              </DialogDescription>
            </DialogHeader>
            {newlyCreatedKey ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                    API Keyが作成されました。このキーは一度だけ表示されます。
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-white dark:bg-gray-900 rounded text-sm break-all">
                      {newlyCreatedKey}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopyKey(newlyCreatedKey)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => {
                    setNewlyCreatedKey(null);
                    setCreateDialogOpen(false);
                  }}>
                    閉じる
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="keyName">API Key名</Label>
                    <Input
                      id="keyName"
                      placeholder="例: 本番環境用、開発用など"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    キャンセル
                  </Button>
                  <Button onClick={handleCreateKey}>
                    作成
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* 削除確認ダイアログ */}
        <AlertDialog open={!!deleteKeyId} onOpenChange={() => setDeleteKeyId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>API Keyを削除しますか？</AlertDialogTitle>
              <AlertDialogDescription>
                このAPI Keyを使用しているシステムはアクセスできなくなります。
                この操作は取り消せません。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteKey}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                削除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
