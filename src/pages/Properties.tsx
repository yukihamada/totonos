import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Home,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { getBuildingTypeLabel } from '@/types/estate';
import type { Database } from '@/integrations/supabase/types';

type DbBuilding = Database['public']['Tables']['buildings']['Row'];

interface BuildingWithUnits extends DbBuilding {
  units: { id: string; status: string }[];
}

export default function Properties() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: buildings, isLoading } = useQuery({
    queryKey: ['buildings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('buildings')
        .select(`
          *,
          units (id, status)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BuildingWithUnits[];
    },
    enabled: !!user?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // First delete units
      await supabase.from('units').delete().eq('building_id', id);

      // Then delete building
      const { error } = await supabase.from('buildings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('物件を削除しました');
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
    },
    onError: (error: Error) => {
      toast.error('削除に失敗しました', { description: error.message });
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`「${name}」を削除しますか？関連する部屋も削除されます。`)) return;
    deleteMutation.mutate(id);
  };

  const filteredBuildings =
    buildings?.filter(
      (building) =>
        building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (building.address_line1?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (building.city?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    ) || [];

  const getAddress = (building: DbBuilding) => {
    const parts = [building.prefecture, building.city, building.address_line1].filter(Boolean);
    return parts.join('') || '住所未登録';
  };

  // Calculate summary stats
  const totalBuildings = buildings?.length || 0;
  const totalUnits = buildings?.reduce((sum, b) => sum + (b.units?.length || 0), 0) || 0;
  const occupiedUnits = buildings?.reduce((sum, b) => sum + (b.units?.filter((u) => u.status === 'occupied').length || 0), 0) || 0;
  const vacantUnits = totalUnits - occupiedUnits;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">物件管理</h1>
          <p className="text-muted-foreground">建物と部屋の一覧・管理</p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/properties/new')}>
          <Plus className="h-4 w-4" />
          物件を追加
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalBuildings}</div>
            <p className="text-sm text-muted-foreground">物件数</p>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalUnits}</div>
            <p className="text-sm text-muted-foreground">総部屋数</p>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-chart-2">{occupiedUnits}</div>
            <p className="text-sm text-muted-foreground">入居中</p>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-chart-1">{vacantUnits}</div>
            <p className="text-sm text-muted-foreground">空室</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="物件名・住所で検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-2"
        />
      </div>

      {/* Buildings Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-2">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredBuildings.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBuildings.map((building) => {
            const totalUnits = building.units?.length || building.total_units || 0;
            const occupiedUnits = building.units?.filter((u) => u.status === 'occupied').length || 0;
            const vacantUnits = building.units?.filter((u) => u.status === 'vacant').length || 0;

            return (
              <Card
                key={building.id}
                className="border-2 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/properties/${building.id}`)}
              >
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{building.name}</CardTitle>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {getBuildingTypeLabel(building.building_type)}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-2">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/properties/${building.id}`); }}>
                        詳細を見る
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/properties/${building.id}/edit`); }}>
                        編集
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => { e.stopPropagation(); handleDelete(building.id, building.name); }}
                      >
                        削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{getAddress(building)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{totalUnits}室</span>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">
                        入居: {occupiedUnits}
                      </Badge>
                      {vacantUnits > 0 && (
                        <Badge variant="outline" className="text-xs border-chart-1 text-chart-1">
                          空室: {vacantUnits}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {building.year_built && (
                    <div className="text-xs text-muted-foreground">
                      築{new Date().getFullYear() - building.year_built}年（{building.year_built}年竣工）
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">物件が見つかりません</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            {searchQuery ? '検索条件を変更するか、' : ''}新しい物件を追加してください
          </p>
          <Button onClick={() => navigate('/properties/new')}>
            <Plus className="h-4 w-4 mr-2" />
            物件を追加
          </Button>
        </div>
      )}
    </div>
  );
}
