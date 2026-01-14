import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Archive,
  Tag,
} from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: Date;
}

const mockProducts: Product[] = [
  {
    id: '1',
    sku: 'PRD-001',
    name: 'Webサイト制作パッケージ',
    description: '企業向けWebサイト制作一式',
    category: 'サービス',
    price: 500000,
    cost: 200000,
    stock: 999,
    minStock: 1,
    unit: '件',
    status: 'active',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    sku: 'PRD-002',
    name: 'システム開発（人月）',
    description: 'カスタムシステム開発',
    category: 'サービス',
    price: 800000,
    cost: 500000,
    stock: 999,
    minStock: 1,
    unit: '人月',
    status: 'active',
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '3',
    sku: 'HW-001',
    name: 'ノートPC（標準スペック）',
    description: '業務用ノートパソコン',
    category: 'ハードウェア',
    price: 150000,
    cost: 100000,
    stock: 15,
    minStock: 5,
    unit: '台',
    status: 'active',
    createdAt: new Date('2024-03-01'),
  },
  {
    id: '4',
    sku: 'HW-002',
    name: '外付けモニター 27インチ',
    description: '4K対応外付けモニター',
    category: 'ハードウェア',
    price: 45000,
    cost: 30000,
    stock: 3,
    minStock: 5,
    unit: '台',
    status: 'active',
    createdAt: new Date('2024-04-01'),
  },
  {
    id: '5',
    sku: 'SW-001',
    name: 'クラウドストレージ（年間）',
    description: '1TB クラウドストレージサービス',
    category: 'ソフトウェア',
    price: 12000,
    cost: 6000,
    stock: 999,
    minStock: 1,
    unit: 'ライセンス',
    status: 'active',
    createdAt: new Date('2024-05-01'),
  },
  {
    id: '6',
    sku: 'CON-001',
    name: 'コンサルティング（時間）',
    description: 'IT戦略コンサルティング',
    category: 'サービス',
    price: 50000,
    cost: 20000,
    stock: 999,
    minStock: 1,
    unit: '時間',
    status: 'active',
    createdAt: new Date('2024-06-01'),
  },
  {
    id: '7',
    sku: 'HW-003',
    name: 'USBハブ 4ポート',
    description: 'USB 3.0 対応ハブ',
    category: 'ハードウェア',
    price: 3500,
    cost: 2000,
    stock: 0,
    minStock: 10,
    unit: '個',
    status: 'inactive',
    createdAt: new Date('2024-07-01'),
  },
];

const categories = ['サービス', 'ハードウェア', 'ソフトウェア', '消耗品', 'その他'];

export default function Products() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category: 'サービス',
    price: '',
    cost: '',
    stock: '',
    minStock: '',
    unit: '個',
  });

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const activeCount = products.filter((p) => p.status === 'active').length;
  const lowStockCount = products.filter((p) => p.stock < p.minStock && p.stock > 0).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  const handleSave = () => {
    if (!formData.name || !formData.sku) {
      toast.error('必須項目を入力してください');
      return;
    }

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                ...formData,
                price: Number(formData.price),
                cost: Number(formData.cost),
                stock: Number(formData.stock),
                minStock: Number(formData.minStock),
              }
            : p
        )
      );
      toast.success('商品を更新しました');
    } else {
      const newProduct: Product = {
        id: crypto.randomUUID(),
        sku: formData.sku,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: Number(formData.price),
        cost: Number(formData.cost),
        stock: Number(formData.stock),
        minStock: Number(formData.minStock),
        unit: formData.unit,
        status: 'active',
        createdAt: new Date(),
      };
      setProducts((prev) => [newProduct, ...prev]);
      toast.success('商品を追加しました');
    }

    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      sku: '',
      name: '',
      description: '',
      category: 'サービス',
      price: '',
      cost: '',
      stock: '',
      minStock: '',
      unit: '個',
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price.toString(),
      cost: product.cost.toString(),
      stock: product.stock.toString(),
      minStock: product.minStock.toString(),
      unit: product.unit,
    });
    setDialogOpen(true);
  };

  const handleDelete = (product: Product) => {
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    toast.success(`${product.name}を削除しました`);
  };

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          在庫切れ
        </Badge>
      );
    }
    if (product.stock < product.minStock) {
      return (
        <Badge variant="secondary" className="gap-1 bg-yellow-100 text-yellow-800">
          <AlertTriangle className="h-3 w-3" />
          在庫少
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="gap-1 bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3" />
        適正
      </Badge>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Package className="h-8 w-8" />
              商品管理
            </h1>
            <p className="text-muted-foreground">
              {activeCount}商品が有効
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                商品を追加
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? '商品を編集' : '商品を追加'}
                </DialogTitle>
                <DialogDescription>
                  商品情報を入力してください
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SKU *</Label>
                    <Input
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="PRD-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>カテゴリ</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>商品名 *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>説明</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>販売価格</Label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>原価</Label>
                    <Input
                      type="number"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>単位</Label>
                    <Input
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>在庫数</Label>
                    <Input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>最低在庫数</Label>
                    <Input
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleSave}>保存</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>総商品数</CardDescription>
              <CardTitle className="text-2xl">{products.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>在庫少</CardDescription>
              <CardTitle className="text-2xl text-yellow-600">{lowStockCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>在庫切れ</CardDescription>
              <CardTitle className="text-2xl text-destructive">{outOfStockCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>在庫総額</CardDescription>
              <CardTitle className="text-2xl">¥{totalValue.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="商品名、SKUで検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="カテゴリ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>商品一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>商品名</TableHead>
                  <TableHead>カテゴリ</TableHead>
                  <TableHead className="text-right">販売価格</TableHead>
                  <TableHead className="text-right">在庫</TableHead>
                  <TableHead>状態</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {product.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ¥{product.price.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {product.stock} {product.unit}
                    </TableCell>
                    <TableCell>{getStockStatus(product)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(product)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
