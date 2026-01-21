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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Plus, Users, Star, Globe, Mail, Phone } from 'lucide-react';
import { useVacationGuests, useCreateGuest } from '@/hooks/useVacationRental';
import { format, parseISO } from 'date-fns';

export default function Guests() {
  const { data: guests, isLoading } = useVacationGuests();
  const createGuest = useCreateGuest();

  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    name_kana: '',
    email: '',
    phone: '',
    nationality: '',
    passport_number: '',
    address: '',
    notes: '',
  });

  const filteredGuests = guests?.filter((guest) =>
    guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.phone?.includes(searchQuery)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createGuest.mutateAsync(formData);
    setDialogOpen(false);
    setFormData({
      name: '',
      name_kana: '',
      email: '',
      phone: '',
      nationality: '',
      passport_number: '',
      address: '',
      notes: '',
    });
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">ゲスト管理</h1>
            <p className="text-muted-foreground mt-1">
              宿泊ゲストの情報を管理
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                ゲスト追加
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>新規ゲスト登録</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">氏名 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="山田 太郎"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name_kana">氏名（カナ）</Label>
                    <Input
                      id="name_kana"
                      value={formData.name_kana}
                      onChange={(e) => setFormData({ ...formData, name_kana: e.target.value })}
                      placeholder="ヤマダ タロウ"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">電話番号</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nationality">国籍</Label>
                    <Input
                      id="nationality"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      placeholder="日本"
                    />
                  </div>
                  <div>
                    <Label htmlFor="passport_number">パスポート番号</Label>
                    <Input
                      id="passport_number"
                      value={formData.passport_number}
                      onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">住所</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">メモ</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    キャンセル
                  </Button>
                  <Button type="submit" disabled={createGuest.isPending}>
                    {createGuest.isPending ? '登録中...' : '登録する'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="名前・メール・電話番号で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Guests Table */}
        {isLoading ? (
          <Skeleton className="h-96" />
        ) : filteredGuests?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">ゲストがいません</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? '検索条件に一致するゲストがいません' : '最初のゲストを登録してください'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  ゲスト追加
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>氏名</TableHead>
                  <TableHead>連絡先</TableHead>
                  <TableHead>国籍</TableHead>
                  <TableHead>宿泊回数</TableHead>
                  <TableHead>登録日</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuests?.map((guest) => (
                  <TableRow key={guest.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{guest.name}</p>
                        {guest.name_kana && (
                          <p className="text-xs text-muted-foreground">{guest.name_kana}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {guest.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{guest.email}</span>
                          </div>
                        )}
                        {guest.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{guest.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {guest.nationality && (
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3 text-muted-foreground" />
                          <span>{guest.nationality}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span>{guest.previous_stays}回</span>
                        {guest.previous_stays >= 3 && (
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(parseISO(guest.created_at), 'yyyy/M/d')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        <p className="text-sm text-muted-foreground mt-4">
          {filteredGuests?.length || 0}名のゲスト
        </p>
      </div>
    </AppLayout>
  );
}
