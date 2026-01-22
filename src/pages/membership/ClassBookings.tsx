import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Plus, 
  Calendar, 
  Search, 
  MoreVertical, 
  UserCheck, 
  X, 
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useClassBookings, useClassSchedules, useMembers } from "@/hooks/useMembership";
import { format, isToday, isFuture, isPast, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

const DAYS_OF_WEEK = ["日", "月", "火", "水", "木", "金", "土"];

export default function ClassBookings() {
  const { bookings, isLoading, createBooking, cancelBooking, checkIn } = useClassBookings();
  const { schedules } = useClassSchedules();
  const { members } = useMembers();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  
  // Form state
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [bookingDate, setBookingDate] = useState(format(new Date(), "yyyy-MM-dd"));

  // Stats
  const confirmedBookings = bookings.filter(b => b.status === "confirmed" && !b.cancelled_at);
  const checkedInBookings = bookings.filter(b => b.checked_in_at);
  const cancelledBookings = bookings.filter(b => b.status === "cancelled" || b.cancelled_at);
  const todayBookings = bookings.filter(b => isToday(parseISO(b.booking_date)));

  const handleSubmit = async () => {
    if (!selectedScheduleId || !selectedMemberId || !bookingDate) return;
    
    await createBooking.mutateAsync({
      class_schedule_id: selectedScheduleId,
      member_id: selectedMemberId,
      booking_date: bookingDate,
    });
    
    setIsDialogOpen(false);
    setSelectedScheduleId("");
    setSelectedMemberId("");
    setBookingDate(format(new Date(), "yyyy-MM-dd"));
  };

  const handleCancel = async (id: string) => {
    if (confirm("この予約をキャンセルしてもよろしいですか？")) {
      await cancelBooking.mutateAsync(id);
    }
  };

  const handleCheckIn = async (id: string) => {
    await checkIn.mutateAsync(id);
  };

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const memberName = booking.member?.name || "";
    const scheduleTitle = booking.class_schedule?.title || "";
    
    const matchesSearch = 
      memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheduleTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "confirmed" && booking.status === "confirmed" && !booking.cancelled_at) ||
      (statusFilter === "checked_in" && booking.checked_in_at) ||
      (statusFilter === "cancelled" && (booking.status === "cancelled" || booking.cancelled_at));
    
    const matchesDate = !dateFilter || booking.booking_date === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (booking: typeof bookings[0]) => {
    if (booking.cancelled_at || booking.status === "cancelled") {
      return <Badge variant="destructive">キャンセル</Badge>;
    }
    if (booking.checked_in_at) {
      return <Badge variant="default" className="bg-primary/80">チェックイン済</Badge>;
    }
    if (isPast(parseISO(booking.booking_date)) && !isToday(parseISO(booking.booking_date))) {
      return <Badge variant="secondary">期限切れ</Badge>;
    }
    return <Badge variant="default">予約確定</Badge>;
  };

  const getScheduleLabel = (schedule: typeof schedules[0]) => {
    const day = schedule.day_of_week !== null ? DAYS_OF_WEEK[schedule.day_of_week] : "";
    return `${schedule.title} (${day} ${schedule.start_time}~${schedule.end_time})`;
  };

  // Active members for booking
  const activeMembers = members.filter(m => m.status === "active");

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calendar className="h-8 w-8" />
              予約管理
            </h1>
            <p className="text-muted-foreground">クラス予約の確認・管理</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新規予約
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新規予約登録</DialogTitle>
                <DialogDescription>
                  クラスと会員を選択して予約を登録してください
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>クラス *</Label>
                  <Select value={selectedScheduleId} onValueChange={setSelectedScheduleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="クラスを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {schedules.length === 0 ? (
                        <SelectItem value="" disabled>
                          クラスがありません
                        </SelectItem>
                      ) : (
                        schedules.map((schedule) => (
                          <SelectItem key={schedule.id} value={schedule.id}>
                            {getScheduleLabel(schedule)}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>会員 *</Label>
                  <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                    <SelectTrigger>
                      <SelectValue placeholder="会員を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeMembers.length === 0 ? (
                        <SelectItem value="" disabled>
                          アクティブな会員がいません
                        </SelectItem>
                      ) : (
                        activeMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name} ({member.member_number})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>予約日 *</Label>
                  <Input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!selectedScheduleId || !selectedMemberId || !bookingDate}
                >
                  予約登録
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                本日の予約
              </CardDescription>
              <CardTitle className="text-2xl">{todayBookings.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                確定済み
              </CardDescription>
              <CardTitle className="text-2xl">{confirmedBookings.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <UserCheck className="h-4 w-4" />
                チェックイン済
              </CardDescription>
              <CardTitle className="text-2xl">{checkedInBookings.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <XCircle className="h-4 w-4" />
                キャンセル
              </CardDescription>
              <CardTitle className="text-2xl">{cancelledBookings.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">すべて</TabsTrigger>
            <TabsTrigger value="today">本日</TabsTrigger>
            <TabsTrigger value="upcoming">今後</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="会員名、クラス名で検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="ステータス" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="confirmed">予約確定</SelectItem>
                      <SelectItem value="checked_in">チェックイン済</SelectItem>
                      <SelectItem value="cancelled">キャンセル</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full sm:w-[180px]"
                    placeholder="日付で絞り込み"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Bookings Table */}
            <Card>
              <CardHeader>
                <CardTitle>予約一覧（{filteredBookings.length}件）</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-center text-muted-foreground py-8">読み込み中...</p>
                ) : filteredBookings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {searchQuery || statusFilter !== "all" || dateFilter 
                      ? "該当する予約がありません" 
                      : "予約がまだありません"}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>予約日</TableHead>
                          <TableHead>クラス</TableHead>
                          <TableHead>会員</TableHead>
                          <TableHead>時間</TableHead>
                          <TableHead>ステータス</TableHead>
                          <TableHead>予約日時</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>
                              <div className="font-medium">
                                {format(parseISO(booking.booking_date), "yyyy/MM/dd (E)", { locale: ja })}
                              </div>
                              {isToday(parseISO(booking.booking_date)) && (
                                <Badge variant="outline" className="mt-1">本日</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {booking.class_schedule?.title || "不明"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {booking.class_schedule?.instructor_name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {booking.member?.name || "不明"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {booking.member?.member_number}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="h-3 w-3" />
                                {booking.class_schedule?.start_time} - {booking.class_schedule?.end_time}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(booking)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(new Date(booking.booked_at), "MM/dd HH:mm")}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {!booking.checked_in_at && !booking.cancelled_at && booking.status !== "cancelled" && (
                                    <>
                                      <DropdownMenuItem onClick={() => handleCheckIn(booking.id)}>
                                        <UserCheck className="h-4 w-4 mr-2" />
                                        チェックイン
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => handleCancel(booking.id)}
                                        className="text-destructive"
                                      >
                                        <X className="h-4 w-4 mr-2" />
                                        キャンセル
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {(booking.checked_in_at || booking.cancelled_at || booking.status === "cancelled") && (
                                    <DropdownMenuItem disabled>
                                      <AlertCircle className="h-4 w-4 mr-2" />
                                      操作なし
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="today" className="space-y-4">
            <TodayBookingsView 
              bookings={todayBookings} 
              onCheckIn={handleCheckIn}
              onCancel={handleCancel}
            />
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            <UpcomingBookingsView 
              bookings={bookings.filter(b => 
                isFuture(parseISO(b.booking_date)) && 
                !b.cancelled_at && 
                b.status !== "cancelled"
              )}
              onCancel={handleCancel}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

// Booking type for sub-components
interface BookingItem {
  id: string;
  booking_date: string;
  checked_in_at: string | null;
  cancelled_at: string | null;
  status: string;
  member?: { name: string; member_number: string | null } | null;
  class_schedule?: { title: string; start_time: string; end_time: string; instructor_name: string | null } | null;
}

// Today's Bookings View Component
function TodayBookingsView({ 
  bookings, 
  onCheckIn, 
  onCancel 
}: { 
  bookings: BookingItem[]; 
  onCheckIn: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          本日の予約はありません
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {bookings.map((booking) => (
        <Card key={booking.id} className={booking.cancelled_at ? "opacity-60" : ""}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{booking.class_schedule?.title}</CardTitle>
                <CardDescription>
                  {booking.class_schedule?.start_time} - {booking.class_schedule?.end_time}
                </CardDescription>
              </div>
              {booking.checked_in_at ? (
                <Badge variant="default" className="bg-primary/80">チェックイン済</Badge>
              ) : booking.cancelled_at ? (
                <Badge variant="destructive">キャンセル</Badge>
              ) : (
                <Badge variant="default">予約中</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{booking.member?.name}</span>
                <span className="text-sm text-muted-foreground">
                  ({booking.member?.member_number})
                </span>
              </div>
              {booking.class_schedule?.instructor_name && (
                <p className="text-sm text-muted-foreground">
                  インストラクター: {booking.class_schedule.instructor_name}
                </p>
              )}
            </div>
            
            {!booking.checked_in_at && !booking.cancelled_at && (
              <div className="flex gap-2 mt-4">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onCheckIn(booking.id)}
                >
                  <UserCheck className="h-4 w-4 mr-1" />
                  チェックイン
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onCancel(booking.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Upcoming Bookings View Component
function UpcomingBookingsView({ 
  bookings, 
  onCancel 
}: { 
  bookings: BookingItem[]; 
  onCancel: (id: string) => void;
}) {
  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          今後の予約はありません
        </CardContent>
      </Card>
    );
  }

  // Group by date
  const groupedByDate = bookings.reduce((acc, booking) => {
    const date = booking.booking_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(booking);
    return acc;
  }, {} as Record<string, BookingItem[]>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedByDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, dateBookings]) => (
          <Card key={date}>
            <CardHeader>
              <CardTitle className="text-lg">
                {format(parseISO(date), "yyyy年MM月dd日 (EEEE)", { locale: ja })}
              </CardTitle>
              <CardDescription>{dateBookings.length}件の予約</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dateBookings.map((booking) => (
                  <div 
                    key={booking.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{booking.class_schedule?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.class_schedule?.start_time} - {booking.class_schedule?.end_time}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm">{booking.member?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.member?.member_number}
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => onCancel(booking.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
