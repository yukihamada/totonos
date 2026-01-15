import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  FileSpreadsheet,
  PieChart,
  Building2,
  Receipt,
  Settings,
  Plus,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Calculator,
  Wallet,
  CreditCard,
  Lock,
  FileText,
  Users
} from 'lucide-react';
import { useAccounts, useJournalEntries, useExpenseClaims, useFixedAssets, useInitializeAccounts } from '@/hooks/useAccounting';
import { formatCurrency } from '@/types/database';
import { getAccountTypeLabel } from '@/types/accounting';
import { toast } from 'sonner';

export default function Accounting() {
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: journalEntries, isLoading: entriesLoading } = useJournalEntries();
  const { data: expenseClaims } = useExpenseClaims();
  const { data: fixedAssets } = useFixedAssets();
  const initializeAccounts = useInitializeAccounts();
  
  const hasAccounts = accounts && accounts.length > 0;
  
  const handleInitializeAccounts = async () => {
    try {
      await initializeAccounts.mutateAsync();
      toast.success('勘定科目を初期化しました');
    } catch (error) {
      toast.error('勘定科目の初期化に失敗しました');
    }
  };
  
  // Calculate quick stats
  const recentEntries = journalEntries?.slice(0, 5) || [];
  const pendingExpenses = expenseClaims?.filter(c => c.status === 'pending') || [];
  const activeAssets = fixedAssets?.filter(a => a.is_active) || [];
  
  const totalAssetValue = activeAssets.reduce((sum, a) => sum + Number(a.current_book_value), 0);

  const menuItems = [
    {
      title: '仕訳帳',
      description: '日々の取引を記録・管理',
      icon: BookOpen,
      href: '/accounting/journal',
      count: journalEntries?.length || 0,
    },
    {
      title: '総勘定元帳',
      description: '勘定科目別の取引一覧',
      icon: FileSpreadsheet,
      href: '/accounting/ledger',
    },
    {
      title: '財務諸表',
      description: '試算表・BS・PL・CF',
      icon: PieChart,
      href: '/accounting/statements',
    },
    {
      title: '固定資産',
      description: '資産台帳・減価償却',
      icon: Building2,
      href: '/accounting/assets',
      count: activeAssets.length,
    },
    {
      title: '経費管理',
      description: '経費申請・精算',
      icon: Receipt,
      href: '/accounting/expenses',
      count: pendingExpenses.length,
      badge: pendingExpenses.length > 0 ? '承認待ち' : undefined,
    },
    {
      title: '消費税計算',
      description: '消費税の計算・申告準備',
      icon: Calculator,
      href: '/accounting/tax',
    },
    {
      title: '買掛金管理',
      description: 'エイジング分析・支払管理',
      icon: CreditCard,
      href: '/accounting/payables',
    },
    {
      title: 'キャッシュフロー',
      description: 'CF計算書・資金繰り',
      icon: Wallet,
      href: '/accounting/cashflow',
    },
    {
      title: '決算処理',
      description: '期末締め・繰越処理',
      icon: Lock,
      href: '/accounting/period-close',
    },
    {
      title: '仕訳テンプレート',
      description: 'よく使う仕訳パターン',
      icon: FileText,
      href: '/accounting/templates',
    },
    {
      title: '部門管理',
      description: 'コストセンター設定',
      icon: Users,
      href: '/accounting/cost-centers',
    },
    {
      title: '会計設定',
      description: '勘定科目・会計期間・税',
      icon: Settings,
      href: '/accounting/settings',
    },
  ];

  if (accountsLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">会計</h1>
            <p className="text-muted-foreground">フル会計機能で財務を一元管理</p>
          </div>
          <div className="flex gap-2">
            <Link to="/accounting/journal/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                仕訳を入力
              </Button>
            </Link>
          </div>
        </div>

        {!hasAccounts && (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">勘定科目を初期化</h3>
              <p className="text-muted-foreground text-center mb-4">
                会計機能を使用するには、まず勘定科目を初期化してください。
                <br />
                日本の標準勘定科目がセットアップされます。
              </p>
              <Button onClick={handleInitializeAccounts} disabled={initializeAccounts.isPending}>
                {initializeAccounts.isPending ? '初期化中...' : '勘定科目を初期化'}
              </Button>
            </CardContent>
          </Card>
        )}

        {hasAccounts && (
          <>
            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">勘定科目数</CardTitle>
                  <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{accounts?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    有効な勘定科目
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">今月の仕訳</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{journalEntries?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    件の仕訳
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">固定資産</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalAssetValue)}</div>
                  <p className="text-xs text-muted-foreground">
                    現在簿価合計
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">経費精算</CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingExpenses.length}</div>
                  <p className="text-xs text-muted-foreground">
                    件が承認待ち
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Menu Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {menuItems.map((item) => (
                <Link key={item.href} to={item.href}>
                  <Card className="hover:border-foreground/50 transition-colors cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <item.icon className="h-8 w-8" />
                        {item.badge && (
                          <Badge variant="secondary">{item.badge}</Badge>
                        )}
                        {item.count !== undefined && !item.badge && (
                          <span className="text-2xl font-bold">{item.count}</span>
                        )}
                      </div>
                      <CardTitle className="mt-4">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Recent Entries */}
            {recentEntries.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>最近の仕訳</CardTitle>
                    <CardDescription>直近5件の仕訳</CardDescription>
                  </div>
                  <Link to="/accounting/journal">
                    <Button variant="outline" size="sm">
                      すべて表示
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                        <div>
                          <div className="font-medium">{entry.entry_number}</div>
                          <div className="text-sm text-muted-foreground">
                            {entry.entry_date} - {entry.description || '摘要なし'}
                          </div>
                        </div>
                        <div className="text-right">
                          {entry.lines && entry.lines.length > 0 && (
                            <div className="text-sm">
                              {entry.lines.filter(l => l.debit_amount > 0).map(l => (
                                <div key={l.id} className="flex items-center gap-2">
                                  <TrendingUp className="h-3 w-3 text-chart-2" />
                                  <span>{l.account?.account_name}</span>
                                  <span className="font-medium">{formatCurrency(l.debit_amount)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
