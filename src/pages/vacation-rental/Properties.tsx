import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Home, Plus, Search, MapPin, Users, Bed, Bath, DollarSign } from 'lucide-react';
import { useVacationProperties, useCreateProperty } from '@/hooks/useVacationRental';
import { Link } from 'react-router-dom';

const PROPERTY_TYPES = [
  { value: 'entire_home', label: '一軒家' },
  { value: 'apartment', label: 'マンション' },
  { value: 'private_room', label: '個室' },
  { value: 'shared_room', label: 'シェアルーム' },
];

export default function Properties() {
  const { data: properties, isLoading } = useVacationProperties();
  const createProperty = useCreateProperty();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    property_type: 'entire_home',
    max_guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    base_price: 10000,
    cleaning_fee: 3000,
    description: '',
    registration_number: '',
  });

  const filteredProperties = properties?.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProperty.mutateAsync(formData);
    setDialogOpen(false);
    setFormData({
      name: '',
      address: '',
      property_type: 'entire_home',
      max_guests: 2,
      bedrooms: 1,
      bathrooms: 1,
      base_price: 10000,
      cleaning_fee: 3000,
      description: '',
      registration_number: '',
    });
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">物件管理</h1>
            <p className="text-muted-foreground mt-1">
              民泊物件の登録・管理
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                物件を追加
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>新規物件登録</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">物件名 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="例: 渋谷アパートメント A号室"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="address">住所</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="例: 東京都渋谷区..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="property_type">物件タイプ</Label>
                    <Select
                      value={formData.property_type}
                      onValueChange={(value) => setFormData({ ...formData, property_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="registration_number">届出番号</Label>
                    <Input
                      id="registration_number"
                      value={formData.registration_number}
                      onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                      placeholder="M130000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_guests">最大宿泊人数</Label>
                    <Input
                      id="max_guests"
                      type="number"
                      min={1}
                      value={formData.max_guests}
                      onChange={(e) => setFormData({ ...formData, max_guests: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bedrooms">ベッドルーム数</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      min={0}
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bathrooms">バスルーム数</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      min={0}
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="base_price">1泊料金（税込）</Label>
                    <Input
                      id="base_price"
                      type="number"
                      min={0}
                      value={formData.base_price}
                      onChange={(e) => setFormData({ ...formData, base_price: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cleaning_fee">清掃料金</Label>
                    <Input
                      id="cleaning_fee"
                      type="number"
                      min={0}
                      value={formData.cleaning_fee}
                      onChange={(e) => setFormData({ ...formData, cleaning_fee: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">説明</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="物件の説明を入力..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    キャンセル
                  </Button>
                  <Button type="submit" disabled={createProperty.isPending}>
                    {createProperty.isPending ? '登録中...' : '登録する'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="物件名・住所で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>

        {/* Properties Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : filteredProperties?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Home className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">物件がありません</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? '検索条件に一致する物件がありません' : '最初の物件を登録してください'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  物件を追加
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProperties?.map((property) => (
              <Link
                key={property.id}
                to={`/vacation-rental/properties/${property.id}`}
                className="block"
              >
                <Card className="h-full hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{property.name}</CardTitle>
                      <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                        {property.status === 'active' ? '稼働中' : '停止中'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {property.address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{property.address}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{property.max_guests}名</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bed className="h-3 w-3" />
                        <span>{property.bedrooms}室</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="h-3 w-3" />
                        <span>{property.bathrooms}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 font-medium">
                      <DollarSign className="h-4 w-4" />
                      <span>¥{property.base_price?.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">/泊</span>
                    </div>
                    {property.registration_number && (
                      <p className="text-xs text-muted-foreground mt-2">
                        届出番号: {property.registration_number}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
