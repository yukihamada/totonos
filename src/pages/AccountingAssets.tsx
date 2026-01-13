import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Plus, Building2 } from 'lucide-react';
import { useFixedAssets, useCreateFixedAsset } from '@/hooks/useAccounting';
import { formatCurrency } from '@/types/database';
import { 
  getAssetCategoryLabel, 
  getDepreciationMethodLabel,
  type AssetCategory,
  type DepreciationMethod 
} from '@/types/accounting';
import { toast } from 'sonner';

export default function AccountingAssets() {
  const { data: assets, isLoading } = useFixedAssets();
  const createAsset = useCreateFixedAsset();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [newAsset, setNewAsset] = useState({
    asset_name: '',
    asset_code: '',
    asset_category: 'equipment' as AssetCategory,
    acquisition_date: new Date().toISOString().split('T')[0],
    acquisition_cost: 0,
    depreciation_method: 'straight_line' as DepreciationMethod,
    useful_life_years: 5,
    salvage_value: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createAsset.mutateAsync({
        ...newAsset,
        current_book_value: newAsset.acquisition_cost,
        is_active: true,
        disposal_date: null,
        disposal_amount: null,
      });
      
      toast.success('固定資産を登録しました');
      setDialogOpen(false);
      setNewAsset({
        asset_name: '',
        asset_code: '',
        asset_category: 'equipment',
        acquisition_date: new Date().toISOString().split('T')[0],
        acquisition_cost: 0,
        depreciation_method: 'straight_line',
        useful_life_years: 5,
        salvage_value: 0,
      });
    } catch (error) {
      toast.error('登録に失敗しました');
    }
  };

  const activeAssets = assets?.filter(a => a.is_active) || [];
  const totalAcquisition = activeAssets.reduce((sum, a) => sum + Number(a.acquisition_cost), 0);
  const totalBookValue = activeAssets.reduce((sum, a) => sum + Number(a.current_book_value), 0);
  const totalDepreciation = totalAcquisition - totalBookValue;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/accounting">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">固定資産台帳</h1>
            <p className="text-muted-foreground">資産管理・減価償却</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                新規資産
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>新規固定資産登録</DialogTitle>
                  <DialogDescription>
                    固定資産の情報を入力してください
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>資産名 *</Label>
                      <Input
                        value={newAsset.asset_name}
                        onChange={(e) => setNewAsset({ ...newAsset, asset_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>資産コード *</Label>
                      <Input
                        value={newAsset.asset_code}
                        onChange={(e) => setNewAsset({ ...newAsset, asset_code: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>資産区分 *</Label>
                      <Select
                        value={newAsset.asset_category}
                        onValueChange={(value: AssetCategory) => setNewAsset({ ...newAsset, asset_category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="building">建物</SelectItem>
                          <SelectItem value="vehicle">車両運搬具</SelectItem>
                          <SelectItem value="equipment">機械設備</SelectItem>
                          <SelectItem value="software">ソフトウェア</SelectItem>
                          <SelectItem value="furniture">器具備品</SelectItem>
                          <SelectItem value="other">その他</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>取得日 *</Label>
                      <Input
                        type="date"
                        value={newAsset.acquisition_date}
                        onChange={(e) => setNewAsset({ ...newAsset, acquisition_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>取得価額 *</Label>
                      <Input
                        type="number"
                        min="0"
                        value={newAsset.acquisition_cost}
                        onChange={(e) => setNewAsset({ ...newAsset, acquisition_cost: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>残存価額</Label>
                      <Input
                        type="number"
                        min="0"
                        value={newAsset.salvage_value}
                        onChange={(e) => setNewAsset({ ...newAsset, salvage_value: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>償却方法 *</Label>
                      <Select
                        value={newAsset.depreciation_method}
                        onValueChange={(value: DepreciationMethod) => setNewAsset({ ...newAsset, depreciation_method: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="straight_line">定額法</SelectItem>
                          <SelectItem value="declining_balance">定率法</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>耐用年数 *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newAsset.useful_life_years}
                        onChange={(e) => setNewAsset({ ...newAsset, useful_life_years: Number(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    キャンセル
                  </Button>
                  <Button type="submit" disabled={createAsset.isPending}>
                    {createAsset.isPending ? '登録中...' : '登録'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">取得価額合計</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalAcquisition)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">現在簿価合計</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalBookValue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">減価償却累計額</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalDepreciation)}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>固定資産一覧</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">読み込み中...</div>
            ) : !assets || assets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                固定資産がありません
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>資産コード</TableHead>
                    <TableHead>資産名</TableHead>
                    <TableHead>区分</TableHead>
                    <TableHead>取得日</TableHead>
                    <TableHead className="text-right">取得価額</TableHead>
                    <TableHead className="text-right">現在簿価</TableHead>
                    <TableHead>償却方法</TableHead>
                    <TableHead>状態</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-mono">{asset.asset_code}</TableCell>
                      <TableCell className="font-medium">{asset.asset_name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {getAssetCategoryLabel(asset.asset_category)}
                        </Badge>
                      </TableCell>
                      <TableCell>{asset.acquisition_date}</TableCell>
                      <TableCell className="text-right">{formatCurrency(Number(asset.acquisition_cost))}</TableCell>
                      <TableCell className="text-right">{formatCurrency(Number(asset.current_book_value))}</TableCell>
                      <TableCell>{getDepreciationMethodLabel(asset.depreciation_method)}</TableCell>
                      <TableCell>
                        <Badge variant={asset.is_active ? 'default' : 'secondary'}>
                          {asset.is_active ? '使用中' : '除却済'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
