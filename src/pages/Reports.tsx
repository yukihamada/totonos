import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInvoices } from '@/hooks/useInvoices';
import { useClients } from '@/hooks/useClients';
import { useDeals, useLeads } from '@/hooks/useCRM';
import { useEmployees } from '@/hooks/useHR';
import { formatCurrency } from '@/types/database';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { BarChart3, Download, FileText, Users, TrendingUp, DollarSign } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ja } from 'date-fns/locale';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28'];

export default function Reports() {
  const [period, setPeriod] = useState('6months');
  const { data: invoices } = useInvoices();
  const { data: clients } = useClients();
  const { data: deals } = useDeals();
  const { data: leads } = useLeads();
  const { data: employees } = useEmployees();

  // Calculate monthly revenue data
  const getMonthlyData = () => {
    const months = period === '12months' ? 12 : period === '6months' ? 6 : 3;
    const data = [];
    for (let i = months - 1; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStr = format(monthDate, 'yyyy-MM');
      const monthLabel = format(monthDate, 'M月', { locale: ja });

      const monthInvoices = invoices?.filter(inv =>
        inv.issue_date.startsWith(monthStr)
      ) || [];

      const revenue = monthInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
      const paid = monthInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total_amount, 0);
      const count = monthInvoices.length;

      data.push({ month: monthLabel, revenue, paid, count });
    }
    return data;
  };

  // Status distribution
  const getStatusDistribution = () => {
    const statusCounts: Record<string, number> = {};
    invoices?.forEach(inv => {
      statusCounts[inv.status] = (statusCounts[inv.status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  };

  // Client revenue ranking
  const getClientRanking = () => {
    const clientRevenue: Record<string, { name: string; amount: number }> = {};
    invoices?.forEach(inv => {
      const clientId = inv.client_id || 'unknown';
      const clientName = (inv as any).client?.name || '不明';
      if (!clientRevenue[clientId]) {
        clientRevenue[clientId] = { name: clientName, amount: 0 };
      }
      clientRevenue[clientId].amount += inv.total_amount;
    });
    return Object.values(clientRevenue)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  };

  // Deal stage distribution
  const getDealStages = () => {
    const stageCounts: Record<string, number> = {};
    deals?.forEach(deal => {
      stageCounts[deal.stage] = (stageCounts[deal.stage] || 0) + 1;
    });
    const stageLabels: Record<string, string> = {
      initial: '初期',
      proposal: '提案中',
      negotiation: '交渉中',
      contract: '契約',
      won: '成約',
      lost: '失注',
    };
    return Object.entries(stageCounts).map(([stage, count]) => ({
      name: stageLabels[stage] || stage,
      value: count,
    }));
  };

  const monthlyData = getMonthlyData();
  const statusData = getStatusDistribution();
  const clientRanking = getClientRanking();
  const dealStages = getDealStages();

  // Summary stats
  const totalRevenue = invoices?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;
  const paidRevenue = invoices?.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total_amount, 0) || 0;
  const dealValue = deals?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;

  const handleExport = (type: string) => {
    alert(`${type}レポートをエクスポートしました`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-8 w-8" />
              レポート
            </h1>
            <p className="text-muted-foreground">ビジネスデータの分析とレポート</p>
          </div>
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">3ヶ月</SelectItem>
                <SelectItem value="6months">6ヶ月</SelectItem>
                <SelectItem value="12months">12ヶ月</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => handleExport('PDF')}>
              <Download className="mr-2 h-4 w-4" />
              PDF出力
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>総売上</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(totalRevenue)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{invoices?.length || 0}件の請求書</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>入金済み</CardDescription>
              <CardTitle className="text-2xl text-green-600">{formatCurrency(paidRevenue)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                回収率: {totalRevenue > 0 ? Math.round((paidRevenue / totalRevenue) * 100) : 0}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>パイプライン価値</CardDescription>
              <CardTitle className="text-2xl text-blue-600">{formatCurrency(dealValue)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{deals?.length || 0}件の商談</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>取引先数</CardDescription>
              <CardTitle className="text-2xl">{clients?.length || 0}社</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">リード: {leads?.length || 0}件</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">売上分析</TabsTrigger>
            <TabsTrigger value="clients">取引先分析</TabsTrigger>
            <TabsTrigger value="crm">CRM分析</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>月別売上推移</CardTitle>
                  <CardDescription>請求額と入金額の推移</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Bar dataKey="revenue" name="請求額" fill="#8884d8" />
                      <Bar dataKey="paid" name="入金額" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>請求書ステータス分布</CardTitle>
                  <CardDescription>ステータス別の件数</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>月別請求件数</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" name="件数" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>取引先別売上ランキング</CardTitle>
                <CardDescription>売上金額トップ10</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">順位</TableHead>
                      <TableHead>取引先名</TableHead>
                      <TableHead className="text-right">売上金額</TableHead>
                      <TableHead className="text-right">構成比</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientRanking.map((client, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{client.name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(client.amount)}</TableCell>
                        <TableCell className="text-right">
                          {totalRevenue > 0 ? ((client.amount / totalRevenue) * 100).toFixed(1) : 0}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>取引先別売上分布</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={clientRanking.slice(0, 5)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Bar dataKey="amount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crm" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>商談ステージ分布</CardTitle>
                  <CardDescription>現在の商談状況</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dealStages}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dealStages.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>営業サマリー</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>リード数</span>
                    <span className="font-bold text-lg">{leads?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>商談数</span>
                    <span className="font-bold text-lg">{deals?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>成約商談</span>
                    <span className="font-bold text-lg text-green-600">
                      {deals?.filter(d => d.stage === 'won').length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>成約率</span>
                    <span className="font-bold text-lg">
                      {deals && deals.length > 0
                        ? Math.round((deals.filter(d => d.stage === 'won').length / deals.length) * 100)
                        : 0}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
