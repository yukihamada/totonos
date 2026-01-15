import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Building2, Users, FolderTree } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCostCenters, useCreateCostCenter } from '@/hooks/useAccounting';
import { toast } from 'sonner';

export default function AccountingCostCenters() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    parent_id: '',
    manager_name: '',
  });

  const { data: costCenters, isLoading } = useCostCenters();
  const createCostCenter = useCreateCostCenter();

  const handleCreate = async () => {
    if (!formData.code || !formData.name) {
      toast.error('コードと名称を入力してください');
      return;
    }

    try {
      await createCostCenter.mutateAsync({
        code: formData.code,
        name: formData.name,
        parent_id: formData.parent_id || undefined,
        manager_name: formData.manager_name || undefined,
      });
      toast.success('部門を作成しました');
      setIsAddOpen(false);
      setFormData({ code: '', name: '', parent_id: '', manager_name: '' });
    } catch (error) {
      toast.error('部門の作成に失敗しました');
    }
  };

  const getParentName = (parentId: string | null) => {
    if (!parentId) return null;
    const parent = costCenters?.find(c => c.id === parentId);
    return parent ? `${parent.code} ${parent.name}` : null;
  };

  const rootCenters = costCenters?.filter(c => !c.parent_id) || [];
  const getChildren = (parentId: string) => costCenters?.filter(c => c.parent_id === parentId) || [];

  const renderCostCenter = (center: any, level: number = 0) => (
    <>
      <TableRow key={center.id}>
        <TableCell style={{ paddingLeft: `${level * 24 + 16}px` }}>
          <div className="flex items-center gap-2">
            {level > 0 && <span className="text-muted-foreground">└─</span>}
            <span className="font-mono">{center.code}</span>
          </div>
        </TableCell>
        <TableCell className="font-medium">{center.name}</TableCell>
        <TableCell>{center.manager_name || '-'}</TableCell>
        <TableCell>
          {center.is_active ? (
            <Badge className="bg-green-500">有効</Badge>
          ) : (
            <Badge variant="secondary">無効</Badge>
          )}
        </TableCell>
        <TableCell>
          {getParentName(center.parent_id) || '-'}
        </TableCell>
      </TableRow>
      {getChildren(center.id).map(child => renderCostCenter(child, level + 1))}
    </>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/accounting/settings">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">部門管理</h1>
              <p className="text-muted-foreground">コストセンター（部門別会計）の設定</p>
            </div>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                部門を追加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>部門を追加</DialogTitle>
                <DialogDescription>新しい部門（コストセンター）を作成します</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>部門コード *</Label>
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="例: SALES001"
                    />
                  </div>
                  <div>
                    <Label>部門名 *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="例: 営業部"
                    />
                  </div>
                </div>
                <div>
                  <Label>親部門</Label>
                  <Select
                    value={formData.parent_id}
                    onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="なし（トップレベル）" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">なし（トップレベル）</SelectItem>
                      {costCenters?.map((center) => (
                        <SelectItem key={center.id} value={center.id}>
                          {center.code} {center.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>責任者名</Label>
                  <Input
                    value={formData.manager_name}
                    onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                    placeholder="例: 山田太郎"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>キャンセル</Button>
                <Button onClick={handleCreate} disabled={createCostCenter.isPending}>作成</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                総部門数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{costCenters?.length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FolderTree className="h-4 w-4" />
                トップレベル部門
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{rootCenters.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                責任者設定済み
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {costCenters?.filter(c => c.manager_name).length || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cost Centers List */}
        <Card>
          <CardHeader>
            <CardTitle>部門一覧</CardTitle>
            <CardDescription>階層構造で部門を管理できます</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">読み込み中...</p>
            ) : costCenters && costCenters.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>コード</TableHead>
                    <TableHead>部門名</TableHead>
                    <TableHead>責任者</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>親部門</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rootCenters.map(center => renderCostCenter(center))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">部門がありません</p>
                <p className="text-sm text-muted-foreground mt-1">
                  部門別に収支を管理するために部門を登録しましょう
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Info */}
        <Card>
          <CardHeader>
            <CardTitle>部門別会計について</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              部門（コストセンター）を設定すると、仕訳入力時に部門を指定できるようになります。
              これにより、部門別の損益計算や予算管理が可能になります。
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium mb-2">仕訳への部門設定</h3>
                <p className="text-sm text-muted-foreground">
                  仕訳入力画面で各明細に部門を設定できます。費用や収益を部門ごとに集計できます。
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium mb-2">部門別予算管理</h3>
                <p className="text-sm text-muted-foreground">
                  予算設定画面で部門ごとの予算を設定し、実績との比較レポートを作成できます。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
