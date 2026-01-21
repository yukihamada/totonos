import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react';
import { useVacationProperties, useVacationBookings, useCreateBooking } from '@/hooks/useVacationRental';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, isSameDay, isWithinInterval, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

const SOURCE_OPTIONS = [
  { value: 'direct', label: '直接予約' },
  { value: 'airbnb', label: 'Airbnb' },
  { value: 'booking.com', label: 'Booking.com' },
  { value: 'vrbo', label: 'VRBO' },
  { value: 'other', label: 'その他' },
];

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-green-500',
  pending: 'bg-yellow-500',
  cancelled: 'bg-red-500',
  completed: 'bg-blue-500',
};

export default function BookingCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    property_id: '',
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    check_in_date: '',
    check_out_date: '',
    guest_count: 1,
    total_price: 0,
    cleaning_fee: 0,
    source: 'direct',
    notes: '',
  });

  const { data: properties, isLoading: propertiesLoading } = useVacationProperties();
  const { data: bookings, isLoading: bookingsLoading } = useVacationBookings(
    selectedProperty === 'all' ? undefined : selectedProperty
  );
  const createBooking = useCreateBooking();

  const isLoading = propertiesLoading || bookingsLoading;

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getBookingsForDay = (date: Date) => {
    return bookings?.filter((booking) => {
      const checkIn = parseISO(booking.check_in_date);
      const checkOut = parseISO(booking.check_out_date);
      return isWithinInterval(date, { start: checkIn, end: checkOut }) ||
             isSameDay(date, checkIn);
    }) || [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBooking.mutateAsync(formData);
    setDialogOpen(false);
    setFormData({
      property_id: '',
      guest_name: '',
      guest_email: '',
      guest_phone: '',
      check_in_date: '',
      check_out_date: '',
      guest_count: 1,
      total_price: 0,
      cleaning_fee: 0,
      source: 'direct',
      notes: '',
    });
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">予約カレンダー</h1>
            <p className="text-muted-foreground mt-1">
              物件別の予約状況を確認
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                予約を追加
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>新規予約登録</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="property">物件 *</Label>
                  <Select
                    value={formData.property_id}
                    onValueChange={(value) => setFormData({ ...formData, property_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="物件を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties?.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="check_in_date">チェックイン日 *</Label>
                    <Input
                      id="check_in_date"
                      type="date"
                      value={formData.check_in_date}
                      onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="check_out_date">チェックアウト日 *</Label>
                    <Input
                      id="check_out_date"
                      type="date"
                      value={formData.check_out_date}
                      onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="guest_name">ゲスト名</Label>
                    <Input
                      id="guest_name"
                      value={formData.guest_name}
                      onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                      placeholder="山田 太郎"
                    />
                  </div>
                  <div>
                    <Label htmlFor="guest_count">宿泊人数</Label>
                    <Input
                      id="guest_count"
                      type="number"
                      min={1}
                      value={formData.guest_count}
                      onChange={(e) => setFormData({ ...formData, guest_count: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="guest_email">メールアドレス</Label>
                    <Input
                      id="guest_email"
                      type="email"
                      value={formData.guest_email}
                      onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="guest_phone">電話番号</Label>
                    <Input
                      id="guest_phone"
                      value={formData.guest_phone}
                      onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="total_price">宿泊料金</Label>
                    <Input
                      id="total_price"
                      type="number"
                      min={0}
                      value={formData.total_price}
                      onChange={(e) => setFormData({ ...formData, total_price: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="source">予約経路</Label>
                    <Select
                      value={formData.source}
                      onValueChange={(value) => setFormData({ ...formData, source: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SOURCE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    キャンセル
                  </Button>
                  <Button type="submit" disabled={createBooking.isPending}>
                    {createBooking.isPending ? '登録中...' : '予約を登録'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-bold min-w-[140px] text-center">
                  {format(currentMonth, 'yyyy年M月', { locale: ja })}
                </h2>
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={() => setCurrentMonth(new Date())}>
                  今月
                </Button>
              </div>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="物件を選択" />
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

        {/* Calendar Grid */}
        {isLoading ? (
          <Skeleton className="h-[600px]" />
        ) : (
          <Card>
            <CardContent className="p-0">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b">
                {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
                  <div
                    key={day}
                    className={`py-2 text-center text-sm font-medium ${
                      i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : ''
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7">
                {/* Empty cells for days before the first of the month */}
                {Array.from({ length: days[0].getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[100px] border-b border-r bg-muted/30" />
                ))}
                
                {days.map((day) => {
                  const dayBookings = getBookingsForDay(day);
                  const dayOfWeek = day.getDay();
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-[100px] border-b border-r p-1 ${
                        !isSameMonth(day, currentMonth) ? 'bg-muted/30' : ''
                      } ${isToday(day) ? 'bg-primary/5' : ''}`}
                    >
                      <div
                        className={`text-sm font-medium mb-1 ${
                          dayOfWeek === 0 ? 'text-red-500' : dayOfWeek === 6 ? 'text-blue-500' : ''
                        } ${isToday(day) ? 'text-primary' : ''}`}
                      >
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {dayBookings.slice(0, 3).map((booking) => (
                          <div
                            key={booking.id}
                            className={`text-xs px-1 py-0.5 rounded truncate text-white ${STATUS_COLORS[booking.status] || 'bg-gray-500'}`}
                            title={`${booking.property?.name}: ${booking.guest_name || 'ゲスト'}`}
                          >
                            {isSameDay(day, parseISO(booking.check_in_date)) && '▶ '}
                            {booking.property?.name?.slice(0, 6)}
                          </div>
                        ))}
                        {dayBookings.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{dayBookings.length - 3}件
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span>確定</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span>仮予約</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>完了</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>キャンセル</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
