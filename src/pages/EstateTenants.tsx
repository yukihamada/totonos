import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MoreVertical,
  Loader2,
} from 'lucide-react';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { Tenant } from '@/types/estate';

export default function EstateTenants() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_kana: '',
    phone: '',
    mobile: '',
    email: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
  });

  const { data: tenants, isLoading } = useQuery({
    queryKey: ['estate-tenants', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Tenant[];
    },
    enabled: !!user?.id,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('認証が必要です');

      const tenantData = {
        user_id: user.id,
        name: formData.name,
        name_kana: formData.name_kana || null,
        phone: formData.phone || null,
        mobile: formData.mobile || null,
        email: formData.email || null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_phone: formData.emergency_contact_phone || null,
        emergency_contact_relation: formData.emergency_contact_relation || null,
      };

      if (editingTenant) {
        const { error } = await supabase.from('tenants').update(tenantData).eq('id', editingTenant.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('tenants').insert(tenantData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingTenant ? '入居者情報を更新しました' : '入居者を登録しました');
      queryClient.invalidateQueries({ queryKey: ['estate-tenants'] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error('保存に失敗しました', { description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tenants').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('入居者を削除しました');
      queryClient.invalidateQueries({ queryKey: ['estate-tenants'] });
    },
    onError: (error: Error) => {
      toast.error('削除に失敗しました', { description: error.message });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      name_kana: '',
      phone: '',
      mobile: '',
      email: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relation: '',
    });
    setEditingTenant(null);
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      name_kana: tenant.name_kana || '',
      phone: tenant.phone || '',
      mobile: tenant.mobile || '',
      email: tenant.email || '',
      emergency_contact_name: tenant.emergency_contact_name || '',
      emergency_contact_phone: tenant.emergency_contact_phone || '',
      emergency_contact_relation: tenant.emergency_contact_relation || '',
    });
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleDelete = (tenant: Tenant) => {
    if (!confirm(`${tenant.name}さんを削除してもよろしいですか？`)) return;
    deleteMutation.mutate(tenant.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('氏名は必須です');
      return;
    }

    saveMutation.mutate();
  };

  const filteredTenants = tenants?.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tenant.name_kana?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (tenant.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">入居者管理</h1>
          <p className="text-muted-foreground">入居者の一覧・登録・編集</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={handleNew}>
              <Plus className="h-4 w-4" />
              入居者を登録
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg border-2">
            <DialogHeader>
              <DialogTitle>{editingTenant ? '入居者を編集' : '新規入居者登録'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">氏名 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="山田 太郎"
                    className="border-2"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name_kana">フリガナ</Label>
                  <Input
                    id="name_kana"
                    value={formData.name_kana}
                    onChange={(e) => setFormData({ ...formData, name_kana: e.target.value })}
                    placeholder="ヤマダ タロウ"
                    className="border-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">電話番号</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="03-1234-5678"
                    className="border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">携帯電話</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="090-1234-5678"
                    className="border-2"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="yamada@example.com"
                  className="border-2"
                />
              </div>

              <div className="border-t-2 pt-4">
                <h4 className="font-medium mb-3">緊急連絡先</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_name">氏名</Label>
                    <Input
                      id="emergency_name"
                      value={formData.emergency_contact_name}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                      className="border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_phone">電話番号</Label>
                    <Input
                      id="emergency_phone"
                      type="tel"
                      value={formData.emergency_contact_phone}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                      className="border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_relation">続柄</Label>
                    <Input
                      id="emergency_relation"
                      value={formData.emergency_contact_relation}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_relation: e.target.value })}
                      placeholder="父"
                      className="border-2"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-2"
                  onClick={() => setIsDialogOpen(false)}
                >
                  キャンセル
                </Button>
                <Button type="submit" className="flex-1" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? '保存中...' : editingTenant ? '更新' : '登録'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="氏名・フリガナ・メールで検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-2"
        />
      </div>

      {/* Tenants Table */}
      {filteredTenants.length > 0 ? (
        <Card className="border-2">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2">
                  <TableHead>氏名</TableHead>
                  <TableHead>フリガナ</TableHead>
                  <TableHead>連絡先</TableHead>
                  <TableHead>緊急連絡先</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id} className="border-b">
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell className="text-muted-foreground">{tenant.name_kana || '-'}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {tenant.mobile && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {tenant.mobile}
                          </div>
                        )}
                        {tenant.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {tenant.email}
                          </div>
                        )}
                        {!tenant.mobile && !tenant.email && <span className="text-muted-foreground">-</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {tenant.emergency_contact_name ? (
                        <div className="text-sm">
                          <span>{tenant.emergency_contact_name}</span>
                          {tenant.emergency_contact_relation && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {tenant.emergency_contact_relation}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="border-2">
                          <DropdownMenuItem onClick={() => handleEdit(tenant)}>編集</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(tenant)} className="text-destructive">
                            削除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12 border-2 border-dashed">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">入居者が見つかりません</h3>
          <p className="text-muted-foreground mt-1">
            {searchQuery ? '検索条件を変更してください' : '新しい入居者を登録してください'}
          </p>
        </div>
      )}
    </div>
  );
}
