import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Barcode, Package, Truck, AlertTriangle } from 'lucide-react';
import { PRODUCT_CATEGORIES, type ProductFormData } from '@/types/inventory';
import { BarcodeScanButton } from './BarcodeScanButton';

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  suppliers?: { id: string; name: string }[];
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ProductForm({
  initialData,
  suppliers = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    sku: '',
    jan_code: null,
    name: '',
    name_kana: null,
    description: null,
    category: 'その他',
    price: 0,
    cost: null,
    tax_rate: 10,
    stock_quantity: 0,
    min_stock: null,
    reorder_point: null,
    reorder_quantity: null,
    unit: '個',
    location: null,
    supplier_id: null,
    supplier_product_code: null,
    lead_time_days: 3,
    status: 'active',
    is_inventory_managed: true,
    notes: null,
    ...initialData,
  });

  const [janCodeError, setJanCodeError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const validateJanCode = (code: string): boolean => {
    if (!code) return true;
    
    // JANコードは8桁または13桁
    if (!/^\d{8}$|^\d{13}$/.test(code)) {
      setJanCodeError('JANコードは8桁または13桁の数字で入力してください');
      return false;
    }
    
    // チェックディジット検証
    const digits = code.split('').map(Number);
    const checkDigit = digits.pop()!;
    const sum = digits.reduce((acc, digit, index) => {
      const weight = code.length === 13 
        ? (index % 2 === 0 ? 1 : 3)
        : (index % 2 === 0 ? 3 : 1);
      return acc + digit * weight;
    }, 0);
    const calculatedCheck = (10 - (sum % 10)) % 10;
    
    if (calculatedCheck !== checkDigit) {
      setJanCodeError('無効なJANコードです（チェックディジットエラー）');
      return false;
    }
    
    setJanCodeError(null);
    return true;
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.sku) {
      return;
    }
    
    if (formData.jan_code && !validateJanCode(formData.jan_code)) {
      return;
    }
    
    onSubmit(formData);
  };

  const updateField = <K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" className="flex items-center gap-1">
            <Package className="h-4 w-4" />
            基本情報
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            在庫設定
          </TabsTrigger>
          <TabsTrigger value="supplier" className="flex items-center gap-1">
            <Truck className="h-4 w-4" />
            仕入先
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
          {/* SKU & JAN Code */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => updateField('sku', e.target.value)}
                placeholder="PRD-0001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jan_code" className="flex items-center gap-1">
                <Barcode className="h-4 w-4" />
                JANコード
              </Label>
              <div className="flex gap-2">
                <Input
                  id="jan_code"
                  value={formData.jan_code || ''}
                  onChange={(e) => {
                    updateField('jan_code', e.target.value || null);
                    if (e.target.value) validateJanCode(e.target.value);
                  }}
                  placeholder="4901234567890"
                  maxLength={13}
                  className="flex-1"
                />
                <BarcodeScanButton
                  onScan={(code) => {
                    updateField('jan_code', code);
                    validateJanCode(code);
                  }}
                />
              </div>
              {janCodeError && (
                <p className="text-sm text-destructive">{janCodeError}</p>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">商品名 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name_kana">商品名（カナ）</Label>
            <Input
              id="name_kana"
              value={formData.name_kana || ''}
              onChange={(e) => updateField('name_kana', e.target.value || null)}
              placeholder="ショウヒンメイ"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>カテゴリ</Label>
            <Select
              value={formData.category || 'その他'}
              onValueChange={(v) => updateField('category', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => updateField('description', e.target.value || null)}
              rows={2}
            />
          </div>

          {/* Price & Cost */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">販売価格</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => updateField('price', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">原価</Label>
              <Input
                id="cost"
                type="number"
                value={formData.cost || ''}
                onChange={(e) => updateField('cost', e.target.value ? Number(e.target.value) : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_rate">税率 (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                value={formData.tax_rate || ''}
                onChange={(e) => updateField('tax_rate', e.target.value ? Number(e.target.value) : null)}
              />
            </div>
          </div>

          {/* Unit */}
          <div className="space-y-2">
            <Label htmlFor="unit">単位</Label>
            <Input
              id="unit"
              value={formData.unit || ''}
              onChange={(e) => updateField('unit', e.target.value || null)}
              placeholder="個、箱、本など"
            />
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4 pt-4">
          {/* Inventory Management Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>在庫管理</Label>
              <p className="text-sm text-muted-foreground">
                この商品の在庫を管理する
              </p>
            </div>
            <Switch
              checked={formData.is_inventory_managed ?? true}
              onCheckedChange={(checked) => updateField('is_inventory_managed', checked)}
            />
          </div>

          {formData.is_inventory_managed && (
            <>
              {/* Stock Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">現在在庫数</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={formData.stock_quantity || 0}
                    onChange={(e) => updateField('stock_quantity', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">保管場所</Label>
                  <Input
                    id="location"
                    value={formData.location || ''}
                    onChange={(e) => updateField('location', e.target.value || null)}
                    placeholder="棚A-1、冷蔵庫など"
                  />
                </div>
              </div>

              {/* Reorder Settings */}
              <div className="rounded-lg border p-4 space-y-4">
                <h4 className="font-medium flex items-center gap-2 text-foreground">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  自動発注設定
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reorder_point">発注点</Label>
                    <Input
                      id="reorder_point"
                      type="number"
                      value={formData.reorder_point || ''}
                      onChange={(e) => updateField('reorder_point', e.target.value ? Number(e.target.value) : null)}
                      placeholder="この数量以下で発注アラート"
                    />
                    <p className="text-xs text-muted-foreground">
                      在庫がこの数量以下になるとアラートが表示されます
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reorder_quantity">発注数量</Label>
                    <Input
                      id="reorder_quantity"
                      type="number"
                      value={formData.reorder_quantity || ''}
                      onChange={(e) => updateField('reorder_quantity', e.target.value ? Number(e.target.value) : null)}
                      placeholder="自動発注時の数量"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_stock">最低在庫数（安全在庫）</Label>
                  <Input
                    id="min_stock"
                    type="number"
                    value={formData.min_stock || ''}
                    onChange={(e) => updateField('min_stock', e.target.value ? Number(e.target.value) : null)}
                    placeholder="常に確保したい在庫数"
                  />
                </div>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="supplier" className="space-y-4 pt-4">
          {/* Supplier Selection */}
          <div className="space-y-2">
            <Label>仕入先</Label>
            <Select
              value={formData.supplier_id || 'none'}
              onValueChange={(v) => updateField('supplier_id', v === 'none' ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="仕入先を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">未設定</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier_product_code">仕入先商品コード</Label>
            <Input
              id="supplier_product_code"
              value={formData.supplier_product_code || ''}
              onChange={(e) => updateField('supplier_product_code', e.target.value || null)}
              placeholder="仕入先での商品コード"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead_time_days">リードタイム（日）</Label>
            <Input
              id="lead_time_days"
              type="number"
              value={formData.lead_time_days || ''}
              onChange={(e) => updateField('lead_time_days', e.target.value ? Number(e.target.value) : null)}
              placeholder="発注から納品までの日数"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">備考</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => updateField('notes', e.target.value || null)}
              rows={3}
            />
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          キャンセル
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting || !formData.name || !formData.sku}>
          {isSubmitting ? '保存中...' : '保存'}
        </Button>
      </DialogFooter>
    </div>
  );
}
