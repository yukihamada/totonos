import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Calendar, MoreVertical, Edit, Trash2, Users, Clock } from "lucide-react";
import { useClassSchedules } from "@/hooks/useMembership";

const DAYS_OF_WEEK = [
  { value: 0, label: "日曜日" },
  { value: 1, label: "月曜日" },
  { value: 2, label: "火曜日" },
  { value: 3, label: "水曜日" },
  { value: 4, label: "木曜日" },
  { value: 5, label: "金曜日" },
  { value: 6, label: "土曜日" },
];

const CLASS_TYPES = [
  { value: "yoga", label: "ヨガ" },
  { value: "pilates", label: "ピラティス" },
  { value: "aerobics", label: "エアロビクス" },
  { value: "strength", label: "筋トレ" },
  { value: "martial_arts", label: "格闘技" },
  { value: "dance", label: "ダンス" },
  { value: "other", label: "その他" },
];

export default function ClassSchedules() {
  const { schedules, isLoading, createSchedule, updateSchedule, deleteSchedule } = useClassSchedules();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<typeof schedules[0] | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [classType, setClassType] = useState("other");
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [instructorName, setInstructorName] = useState("");
  const [capacity, setCapacity] = useState(20);
  const [location, setLocation] = useState("");

  const handleOpenDialog = (schedule?: typeof schedules[0]) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setTitle(schedule.title);
      setClassType(schedule.class_type || "other");
      setDayOfWeek(schedule.day_of_week ?? 1);
      setStartTime(schedule.start_time);
      setEndTime(schedule.end_time);
      setInstructorName(schedule.instructor_name || "");
      setCapacity(schedule.capacity || 20);
      setLocation(schedule.location || "");
    } else {
      setEditingSchedule(null);
      setTitle("");
      setClassType("other");
      setDayOfWeek(1);
      setStartTime("10:00");
      setEndTime("11:00");
      setInstructorName("");
      setCapacity(20);
      setLocation("");
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    
    if (editingSchedule) {
      await updateSchedule.mutateAsync({
        id: editingSchedule.id,
        title,
        class_type: classType,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        instructor_name: instructorName || null,
        capacity,
        location: location || null,
      });
    } else {
      await createSchedule.mutateAsync({
        title,
        class_type: classType,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        instructor_name: instructorName || undefined,
        capacity,
        location: location || undefined,
      });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("このスケジュールを削除してもよろしいですか？")) {
      await deleteSchedule.mutateAsync(id);
    }
  };

  // Group schedules by day of week
  const schedulesByDay = DAYS_OF_WEEK.map(day => ({
    ...day,
    schedules: schedules.filter(s => s.day_of_week === day.value)
      .sort((a, b) => a.start_time.localeCompare(b.start_time)),
  }));

  const getClassTypeLabel = (type: string | null) => {
    return CLASS_TYPES.find(t => t.value === type)?.label || type;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calendar className="h-8 w-8" />
              スケジュール
            </h1>
            <p className="text-muted-foreground">週間クラススケジュールの管理</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                クラス追加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingSchedule ? "クラス編集" : "新規クラス追加"}</DialogTitle>
                <DialogDescription>
                  クラスの詳細を入力してください
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">クラス名 *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="朝ヨガ"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="classType">クラスタイプ</Label>
                    <Select value={classType} onValueChange={setClassType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CLASS_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dayOfWeek">曜日</Label>
                    <Select value={String(dayOfWeek)} onValueChange={(v) => setDayOfWeek(Number(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map(day => (
                          <SelectItem key={day.value} value={String(day.value)}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">開始時間</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">終了時間</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instructorName">インストラクター</Label>
                    <Input
                      id="instructorName"
                      value={instructorName}
                      onChange={(e) => setInstructorName(e.target.value)}
                      placeholder="山田先生"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">定員</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                      min={1}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">場所</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="スタジオA"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleSubmit} disabled={!title.trim()}>
                  {editingSchedule ? "更新" : "追加"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Weekly Schedule */}
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              読み込み中...
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {schedulesByDay.map((day) => (
              <Card key={day.value}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{day.label}</CardTitle>
                  <CardDescription>{day.schedules.length}クラス</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {day.schedules.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      クラスなし
                    </p>
                  ) : (
                    day.schedules.map((schedule) => (
                      <Card key={schedule.id} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="font-medium text-sm">{schedule.title}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {schedule.start_time} - {schedule.end_time}
                            </div>
                            {schedule.instructor_name && (
                              <p className="text-xs text-muted-foreground">
                                {schedule.instructor_name}
                              </p>
                            )}
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {getClassTypeLabel(schedule.class_type)}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {schedule.current_bookings || 0}/{schedule.capacity}
                              </span>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenDialog(schedule)}>
                                <Edit className="h-4 w-4 mr-2" />
                                編集
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(schedule.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                削除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
