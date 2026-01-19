import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
  Barcode,
  ShoppingCart,
} from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useClients } from '@/hooks/useClients';
import { ProductForm } from '@/components/inventory/ProductForm';
import { InventoryAlertBanner } from '@/components/inventory/InventoryAlertBanner';
import { PRODUCT_CATEGORIES, type ProductFormData } from '@/types/inventory';
import { Link } from 'react-router-dom';

export default function Products() {
  const { products, isLoading, createProduct, updateProduct, deleteProduct } = useProducts();
  const clientsQuery = useClients();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const suppliers = (clientsQuery.data ?? []).map(c => ({ id: c.id, name: c.name }));

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.jan_code && p.jan_code.includes(search));
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const activeCount = products.filter((p) => p.status === 'active').length;
  const lowStockCount = products.filter((p) => 
    p.is_inventory_managed && 
    p.stock_quantity < (p.reorder_point || 0) && 
    p.stock_quantity > 0
  ).length;
  const outOfStockCount = products.filter((p) => 
    p.is_inventory_managed && 
    p.stock_quantity === 0
  ).length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock_quantity, 0);

  const handleSave = async (formData: ProductFormData) => {
    if (editingProductId) {
      await updateProduct.mutateAsync({ id: editingProductId, ...formData });
    } else {
      await createProduct.mutateAsync(formData);
    }
    setDialogOpen(false);
    setEditingProductId(null);
  };

  const handleEdit = (productId: string) => {
    setEditingProductId(productId);
    setDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (confirm('この商品を削除しますか？')) {
      await deleteProduct.mutateAsync(productId);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingProductId(null);
    }
  };

  const editingProduct = editingProductId 
    ? products.find(p => p.id === editingProductId) 
    : null;

  const getStockStatus = (product: typeof products[0]) => {
    if (!product.is_inventory_managed) {
      return (
        <Badge variant="outline" className="gap-1">
          管理対象外
        </Badge>
      );
    }
    if (product.stock_quantity === 0) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          在庫切れ
        </Badge>
      );
    }
    if (product.stock_quantity < (product.reorder_point || 0)) {
      return (
        <Badge variant="secondary" className="gap-1 bg-warning/20 text-warning-foreground">
          <AlertTriangle className="h-3 w-3" />
          在庫少
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="gap-1 bg-primary/20 text-primary">
        <CheckCircle className="h-3 w-3" />
        適正
      </Badge>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Inventory Alert Banner */}
        <InventoryAlertBanner />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Package className="h-8 w-8" />
              商品・在庫管理
            </h1>
            <p className="text-muted-foreground">
              {activeCount}商品が有効 | JANコード対応
            </p>
          </div>
          <div className="flex gap-2">
            {(lowStockCount > 0 || outOfStockCount > 0) && (
              <Button variant="outline" className="border-destructive text-destructive" asChild>
                <Link to="/auto-reorder">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  自動発注 ({lowStockCount + outOfStockCount})
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link to="/purchase-orders">
                <ShoppingCart className="mr-2 h-4 w-4" />
                発注書
              </Link>
            </Button>
            <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  商品を追加
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProductId ? '商品を編集' : '商品を追加'}
                  </DialogTitle>
                  <DialogDescription>
                    商品情報を入力してください。JANコードを登録すると在庫管理が効率化されます。
                  </DialogDescription>
                </DialogHeader>
                <ProductForm
                  initialData={editingProduct ? {
                    sku: editingProduct.sku,
                    jan_code: editingProduct.jan_code,
                    name: editingProduct.name,
                    name_kana: editingProduct.name_kana,
                    description: editingProduct.description,
                    category: editingProduct.category,
                    price: editingProduct.price,
                    cost: editingProduct.cost,
                    tax_rate: editingProduct.tax_rate,
                    stock_quantity: editingProduct.stock_quantity,
                    min_stock: editingProduct.min_stock,
                    reorder_point: editingProduct.reorder_point,
                    reorder_quantity: editingProduct.reorder_quantity,
                    unit: editingProduct.unit,
                    location: editingProduct.location,
                    supplier_id: editingProduct.supplier_id,
                    supplier_product_code: editingProduct.supplier_product_code,
                    lead_time_days: editingProduct.lead_time_days,
                    status: editingProduct.status,
                    is_inventory_managed: editingProduct.is_inventory_managed,
                    notes: editingProduct.notes,
                  } : undefined}
                  suppliers={suppliers}
                  onSubmit={handleSave}
                  onCancel={() => handleDialogClose(false)}
                  isSubmitting={createProduct.isPending || updateProduct.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
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
              <CardTitle className="text-2xl text-warning">{lowStockCount}</CardTitle>
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
              placeholder="商品名、SKU、JANコードで検索..."
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
              {PRODUCT_CATEGORIES.map((cat) => (
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
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {products.length === 0 ? (
                  <div>
                    <Package className="mx-auto h-12 w-12 opacity-50 mb-2" />
                    <p>商品がありません</p>
                    <p className="text-sm">「商品を追加」ボタンから登録してください</p>
                  </div>
                ) : (
                  <p>検索条件に一致する商品がありません</p>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>JANコード</TableHead>
                    <TableHead>商品名</TableHead>
                    <TableHead>カテゴリ</TableHead>
                    <TableHead className="text-right">販売価格</TableHead>
                    <TableHead className="text-right">在庫</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell>
                        {product.jan_code ? (
                          <span className="font-mono text-sm flex items-center gap-1">
                            <Barcode className="h-3 w-3" />
                            {product.jan_code}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{product.category || '-'}</TableCell>
                      <TableCell className="text-right">
                        ¥{product.price.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.is_inventory_managed ? (
                          <span>
                            {product.stock_quantity.toLocaleString()} {product.unit || '個'}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStockStatus(product)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(product.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              編集
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(product.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              削除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
