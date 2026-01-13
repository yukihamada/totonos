import { useState } from "react";
import { Plus, Laptop, Search, Trash2, MoreHorizontal } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useITAssets, useCreateITAsset, useDeleteITAsset } from "@/hooks/useWiki";
import { assetTypeLabels, assetStatusLabels } from "@/types/wiki";
import type { AssetType, AssetStatus } from "@/types/wiki";

const statusColors: Record<AssetStatus, string> = {
  in_use: 'bg-green-100 text-green-800',
  in_stock: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  disposed: 'bg-gray-100 text-gray-800',
};

export default function ITAssets() {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    asset_type: "pc" as AssetType,
    asset_name: "",
    asset_code: "",
    manufacturer: "",
    model: "",
    serial_number: "",
    purchase_date: "",
    purchase_price: 0,
    status: "in_stock" as AssetStatus,
    location: "",
  });

  const { data: assets = [], isLoading } = useITAssets();
  const createAsset = useCreateITAsset();
  const deleteAsset = useDeleteITAsset();

  const filtered = assets.filter(a =>
    a.asset_name.toLowerCase().includes(search.toLowerCase()) ||
    a.asset_code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAsset.mutateAsync(formData);
    setIsDialogOpen(false);
    setFormData({ asset_type: "pc", asset_name: "", asset_code: "", manufacturer: "", model: "", serial_number: "", purchase_date: "", purchase_price: 0, status: "in_stock", location: "" });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">IT資産管理</h1>
            <p className="text-muted-foreground">PC・モバイル・ライセンス管理</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />資産を追加</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>新規資産登録</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>種別</Label>
                    <Select value={formData.asset_type} onValueChange={v => setFormData(f => ({ ...f, asset_type: v as AssetType }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(assetTypeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>資産コード *</Label><Input value={formData.asset_code} onChange={e => setFormData(f => ({ ...f, asset_code: e.target.value }))} required /></div>
                </div>
                <div><Label>資産名 *</Label><Input value={formData.asset_name} onChange={e => setFormData(f => ({ ...f, asset_name: e.target.value }))} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>メーカー</Label><Input value={formData.manufacturer} onChange={e => setFormData(f => ({ ...f, manufacturer: e.target.value }))} /></div>
                  <div><Label>モデル</Label><Input value={formData.model} onChange={e => setFormData(f => ({ ...f, model: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>購入日</Label><Input type="date" value={formData.purchase_date} onChange={e => setFormData(f => ({ ...f, purchase_date: e.target.value }))} /></div>
                  <div><Label>購入金額</Label><Input type="number" value={formData.purchase_price} onChange={e => setFormData(f => ({ ...f, purchase_price: Number(e.target.value) }))} /></div>
                </div>
                <div>
                  <Label>ステータス</Label>
                  <Select value={formData.status} onValueChange={v => setFormData(f => ({ ...f, status: v as AssetStatus }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(assetStatusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={createAsset.isPending}>{createAsset.isPending ? "登録中..." : "登録"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="検索..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>コード</TableHead>
                <TableHead>資産名</TableHead>
                <TableHead>種別</TableHead>
                <TableHead>メーカー/モデル</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>購入金額</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">読み込み中...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">
                  <Laptop className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">資産がありません</p>
                </TableCell></TableRow>
              ) : filtered.map(asset => (
                <TableRow key={asset.id}>
                  <TableCell className="font-mono">{asset.asset_code}</TableCell>
                  <TableCell className="font-medium">{asset.asset_name}</TableCell>
                  <TableCell><Badge variant="outline">{assetTypeLabels[asset.asset_type]}</Badge></TableCell>
                  <TableCell>{asset.manufacturer} {asset.model}</TableCell>
                  <TableCell><Badge className={statusColors[asset.status]}>{assetStatusLabels[asset.status]}</Badge></TableCell>
                  <TableCell>¥{asset.purchase_price.toLocaleString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive" onClick={() => { if (confirm("削除しますか？")) deleteAsset.mutate(asset.id); }}><Trash2 className="mr-2 h-4 w-4" />削除</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
