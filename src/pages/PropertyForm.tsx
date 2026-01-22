import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Building2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Building, Unit, PropertyStatus } from '@/types/estate';

const BUILDING_TYPES = [
  { value: 'apartment', label: 'アパート' },
  { value: 'mansion', label: 'マンション' },
  { value: 'house', label: '一戸建て' },
  { value: 'office', label: 'オフィスビル' },
  { value: 'commercial', label: '商業施設' },
  { value: 'parking', label: '駐車場' },
];

const STRUCTURES = [
  { value: 'RC', label: 'RC造（鉄筋コンクリート）' },
  { value: 'SRC', label: 'SRC造（鉄骨鉄筋コンクリート）' },
  { value: 'S', label: 'S造（鉄骨）' },
  { value: 'wood', label: '木造' },
  { value: 'light_steel', label: '軽量鉄骨' },
];

const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
];

interface UnitForm {
  id?: string;
  unit_number: string;
  floor: string;
  layout: string;
  area_sqm: string;
  base_rent: string;
  management_fee: string;
  status: PropertyStatus;
}

export default function PropertyForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = id && id !== 'new';
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    property_code: '',
    postal_code: '',
    prefecture: '',
    city: '',
    address_line1: '',
    address_line2: '',
    building_type: '',
    structure: '',
    floors_above: '',
    floors_below: '',
    year_built: '',
    notes: '',
  });

  const [units, setUnits] = useState<UnitForm[]>([]);

  // Fetch existing building data if editing
  const { data: building, isLoading } = useQuery({
    queryKey: ['building', id],
    queryFn: async () => {
      if (!id || id === 'new') return null;

      const { data, error } = await supabase
        .from('buildings')
        .select(`
          *,
          units (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Building & { units: Unit[] };
    },
    enabled: !!id && id !== 'new',
  });

  // Populate form with existing data
  useEffect(() => {
    if (building) {
      setFormData({
        name: building.name || '',
        property_code: building.property_code || '',
        postal_code: building.postal_code || '',
        prefecture: building.prefecture || '',
        city: building.city || '',
        address_line1: building.address_line1 || '',
        address_line2: building.address_line2 || '',
        building_type: building.building_type || '',
        structure: building.structure || '',
        floors_above: building.floors_above?.toString() || '',
        floors_below: building.floors_below?.toString() || '',
        year_built: building.year_built?.toString() || '',
        notes: building.notes || '',
      });

      if (building.units) {
        setUnits(
          building.units.map((unit) => ({
            id: unit.id,
            unit_number: unit.unit_number,
            floor: unit.floor?.toString() || '',
            layout: unit.layout || '',
            area_sqm: unit.area_sqm?.toString() || '',
            base_rent: unit.base_rent?.toString() || '',
            management_fee: unit.management_fee?.toString() || '',
            status: unit.status,
          }))
        );
      }
    }
  }, [building]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('認証が必要です');

      const buildingData = {
        user_id: user.id,
        name: formData.name,
        property_code: formData.property_code || null,
        postal_code: formData.postal_code || null,
        prefecture: formData.prefecture || null,
        city: formData.city || null,
        address_line1: formData.address_line1 || null,
        address_line2: formData.address_line2 || null,
        building_type: formData.building_type || null,
        structure: formData.structure || null,
        floors_above: formData.floors_above ? parseInt(formData.floors_above, 10) : null,
        floors_below: formData.floors_below ? parseInt(formData.floors_below, 10) : null,
        year_built: formData.year_built ? parseInt(formData.year_built, 10) : null,
        total_units: units.length,
        notes: formData.notes || null,
      };

      let buildingId: string;

      if (isEdit && id) {
        // Update existing building
        const { error } = await supabase.from('buildings').update(buildingData).eq('id', id);
        if (error) throw error;
        buildingId = id;
      } else {
        // Create new building
        const { data, error } = await supabase.from('buildings').insert(buildingData).select('id').single();
        if (error) throw error;
        buildingId = data.id;
      }

      // Handle units
      const existingUnitIds = units.filter((u) => u.id).map((u) => u.id);

      // Delete removed units
      if (isEdit && building?.units) {
        const unitsToDelete = building.units.filter((u) => !existingUnitIds.includes(u.id));
        for (const unit of unitsToDelete) {
          await supabase.from('units').delete().eq('id', unit.id);
        }
      }

      // Upsert units
      for (const unit of units) {
        const unitData = {
          user_id: user.id,
          building_id: buildingId,
          unit_number: unit.unit_number,
          floor: unit.floor ? parseInt(unit.floor, 10) : null,
          layout: unit.layout || null,
          area_sqm: unit.area_sqm ? parseFloat(unit.area_sqm) : null,
          base_rent: unit.base_rent ? parseInt(unit.base_rent, 10) : null,
          management_fee: unit.management_fee ? parseInt(unit.management_fee, 10) : null,
          status: unit.status,
        };

        if (unit.id) {
          // Update existing unit
          await supabase.from('units').update(unitData).eq('id', unit.id);
        } else {
          // Create new unit
          await supabase.from('units').insert(unitData);
        }
      }

      return buildingId;
    },
    onSuccess: (buildingId) => {
      toast.success(isEdit ? '物件を更新しました' : '物件を登録しました');
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      queryClient.invalidateQueries({ queryKey: ['building', buildingId] });
      navigate('/properties');
    },
    onError: (error: Error) => {
      toast.error('保存に失敗しました', { description: error.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('物件名を入力してください');
      return;
    }

    saveMutation.mutate();
  };

  const addUnit = () => {
    setUnits([
      ...units,
      {
        unit_number: '',
        floor: '',
        layout: '',
        area_sqm: '',
        base_rent: '',
        management_fee: '',
        status: 'vacant',
      },
    ]);
  };

  const updateUnit = (index: number, field: keyof UnitForm, value: string) => {
    const newUnits = [...units];
    newUnits[index] = { ...newUnits[index], [field]: value };
    setUnits(newUnits);
  };

  const removeUnit = (index: number) => {
    setUnits(units.filter((_, i) => i !== index));
  };

  if (isEdit && isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card className="border-2">
          <CardContent className="pt-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/properties')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEdit ? '物件を編集' : '新規物件登録'}</h1>
          <p className="text-muted-foreground">建物情報と部屋を登録</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Building Info */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              建物情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">物件名 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="サンプルマンション"
                  className="border-2"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="property_code">物件コード</Label>
                <Input
                  id="property_code"
                  value={formData.property_code}
                  onChange={(e) => setFormData({ ...formData, property_code: e.target.value })}
                  placeholder="A-001"
                  className="border-2"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="building_type">建物種別</Label>
                <Select
                  value={formData.building_type}
                  onValueChange={(value) => setFormData({ ...formData, building_type: value })}
                >
                  <SelectTrigger className="border-2">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUILDING_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="structure">構造</Label>
                <Select
                  value={formData.structure}
                  onValueChange={(value) => setFormData({ ...formData, structure: value })}
                >
                  <SelectTrigger className="border-2">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {STRUCTURES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year_built">竣工年</Label>
                <Input
                  id="year_built"
                  type="number"
                  value={formData.year_built}
                  onChange={(e) => setFormData({ ...formData, year_built: e.target.value })}
                  placeholder="2020"
                  className="border-2"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postal_code">郵便番号</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  placeholder="123-4567"
                  className="border-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prefecture">都道府県</Label>
                <Select
                  value={formData.prefecture}
                  onValueChange={(value) => setFormData({ ...formData, prefecture: value })}
                >
                  <SelectTrigger className="border-2">
                    <SelectValue placeholder="選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREFECTURES.map((pref) => (
                      <SelectItem key={pref} value={pref}>
                        {pref}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">市区町村</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="渋谷区"
                  className="border-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_line1">番地</Label>
                <Input
                  id="address_line1"
                  value={formData.address_line1}
                  onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                  placeholder="1-2-3"
                  className="border-2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">備考</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="管理メモなど"
                className="border-2"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Units */}
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>部屋一覧</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addUnit} className="gap-2">
              <Plus className="h-4 w-4" />
              部屋を追加
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {units.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed">
                <p>部屋が登録されていません</p>
                <Button type="button" variant="link" onClick={addUnit}>
                  部屋を追加する
                </Button>
              </div>
            ) : (
              units.map((unit, index) => (
                <div key={index} className="p-4 border-2 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">部屋 #{index + 1}</h4>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeUnit(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>部屋番号 *</Label>
                      <Input
                        value={unit.unit_number}
                        onChange={(e) => updateUnit(index, 'unit_number', e.target.value)}
                        placeholder="101"
                        className="border-2"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>階</Label>
                      <Input
                        type="number"
                        value={unit.floor}
                        onChange={(e) => updateUnit(index, 'floor', e.target.value)}
                        placeholder="1"
                        className="border-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>間取り</Label>
                      <Input
                        value={unit.layout}
                        onChange={(e) => updateUnit(index, 'layout', e.target.value)}
                        placeholder="1LDK"
                        className="border-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>面積（㎡）</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={unit.area_sqm}
                        onChange={(e) => updateUnit(index, 'area_sqm', e.target.value)}
                        placeholder="45.5"
                        className="border-2"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>賃料（円）</Label>
                      <Input
                        type="number"
                        value={unit.base_rent}
                        onChange={(e) => updateUnit(index, 'base_rent', e.target.value)}
                        placeholder="80000"
                        className="border-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>共益費（円）</Label>
                      <Input
                        type="number"
                        value={unit.management_fee}
                        onChange={(e) => updateUnit(index, 'management_fee', e.target.value)}
                        placeholder="5000"
                        className="border-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>状態</Label>
                      <Select
                        value={unit.status}
                        onValueChange={(value) => updateUnit(index, 'status', value as PropertyStatus)}
                      >
                        <SelectTrigger className="border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vacant">空室</SelectItem>
                          <SelectItem value="occupied">入居中</SelectItem>
                          <SelectItem value="notice_given">退去予定</SelectItem>
                          <SelectItem value="under_renovation">改装中</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="button" variant="outline" className="flex-1 border-2" onClick={() => navigate('/properties')}>
            キャンセル
          </Button>
          <Button type="submit" className="flex-1" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? '保存中...' : isEdit ? '更新' : '登録'}
          </Button>
        </div>
      </form>
    </div>
  );
}
