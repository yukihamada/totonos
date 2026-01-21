import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Search, Plus, MoreHorizontal, Calendar, ExternalLink } from 'lucide-react';
import { useVacationBookings, useVacationProperties, useUpdateBooking, useDeleteBooking } from '@/hooks/useVacationRental';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  confirmed: { label: '確定', variant: 'default' },
  pending: { label: '仮予約', variant: 'secondary' },
  cancelled: { label: 'キャンセル', variant: 'destructive' },
  completed: { label: '完了', variant: 'outline' },
};

const SOURCE_LABELS: Record<string, string> = {
  direct: '直接予約',
  airbnb: 'Airbnb',
  'booking.com': 'Booking.com',
  vrbo: 'VRBO',
  other: 'その他',
};

export default function Bookings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');

  const { data: bookings, isLoading: bookingsLoading } = useVacationBookings();
  const { data: properties } = useVacationProperties();
  const updateBooking = useUpdateBooking();
  const deleteBooking = useDeleteBooking();

  const filteredBookings = bookings?.filter((booking) => {
    const matchesSearch = 
      booking.guest_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.guest_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.property?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesProperty = propertyFilter === 'all' || booking.property_id === propertyFilter;

    return matchesSearch && matchesStatus && matchesProperty;
  });

  const handleStatusChange = async (id: string, status: string) => {
    await updateBooking.mutateAsync({ id, status });
  };

  const handleDelete = async (id: string) => {
    if (confirm('この予約を削除しますか？')) {
      await deleteBooking.mutateAsync(id);
    }
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = parseISO(checkIn);
    const end = parseISO(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">予約一覧</h1>
            <p className="text-muted-foreground mt-1">
              すべての予約を管理
            </p>
          </div>
          <Button asChild>
            <Link to="/vacation-rental/calendar">
              <Plus className="mr-2 h-4 w-4" />
              新規予約
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ゲスト名・メール・物件名で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="confirmed">確定</SelectItem>
                  <SelectItem value="pending">仮予約</SelectItem>
                  <SelectItem value="completed">完了</SelectItem>
                  <SelectItem value="cancelled">キャンセル</SelectItem>
                </SelectContent>
              </Select>
              <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="物件" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべての物件</SelectItem>
                  {properties?.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        {bookingsLoading ? (
          <Skeleton className="h-96" />
        ) : filteredBookings?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">予約がありません</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' || propertyFilter !== 'all'
                  ? '条件に一致する予約がありません'
                  : '最初の予約を登録してください'}
              </p>
              <Button asChild>
                <Link to="/vacation-rental/calendar">
                  <Plus className="mr-2 h-4 w-4" />
                  予約を追加
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>物件</TableHead>
                  <TableHead>ゲスト</TableHead>
                  <TableHead>チェックイン</TableHead>
                  <TableHead>チェックアウト</TableHead>
                  <TableHead>泊数</TableHead>
                  <TableHead>料金</TableHead>
                  <TableHead>経路</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings?.map((booking) => {
                  const nights = calculateNights(booking.check_in_date, booking.check_out_date);
                  const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;

                  return (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        {booking.property?.name || '-'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.guest_name || 'ゲスト'}</p>
                          {booking.guest_email && (
                            <p className="text-xs text-muted-foreground">{booking.guest_email}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(parseISO(booking.check_in_date), 'M/d (E)', { locale: ja })}
                      </TableCell>
                      <TableCell>
                        {format(parseISO(booking.check_out_date), 'M/d (E)', { locale: ja })}
                      </TableCell>
                      <TableCell>{nights}泊</TableCell>
                      <TableCell>
                        ¥{(Number(booking.total_price) + Number(booking.cleaning_fee)).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {SOURCE_LABELS[booking.source] || booking.source}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig.variant}>
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {booking.status === 'pending' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'confirmed')}>
                                確定にする
                              </DropdownMenuItem>
                            )}
                            {booking.status === 'confirmed' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'completed')}>
                                完了にする
                              </DropdownMenuItem>
                            )}
                            {booking.status !== 'cancelled' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'cancelled')}>
                                キャンセル
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDelete(booking.id)}
                              className="text-destructive"
                            >
                              削除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}

        <p className="text-sm text-muted-foreground mt-4">
          {filteredBookings?.length || 0}件の予約
        </p>
      </div>
    </AppLayout>
  );
}
