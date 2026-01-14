import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Video,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
} from "date-fns";
import { ja } from "date-fns/locale";
import { toast } from "sonner";

// Mock data
const mockInterviews = [
  {
    id: "1",
    candidate: { name: "田中一郎", avatar: "TI", position: "フロントエンドエンジニア" },
    type: "技術面接",
    date: new Date("2024-01-18T10:00:00"),
    duration: 60,
    interviewer: { name: "山田太郎", avatar: "YT" },
    location: "オンライン（Zoom）",
    status: "scheduled",
  },
  {
    id: "2",
    candidate: { name: "高橋美咲", avatar: "TM", position: "カスタマーサポート" },
    type: "一次面接",
    date: new Date("2024-01-18T14:00:00"),
    duration: 45,
    interviewer: { name: "木村由美", avatar: "KY" },
    location: "オンライン（Google Meet）",
    status: "scheduled",
  },
  {
    id: "3",
    candidate: { name: "伊藤健太", avatar: "IK", position: "プロダクトマネージャー" },
    type: "最終面接",
    date: new Date("2024-01-19T11:00:00"),
    duration: 60,
    interviewer: { name: "佐々木一郎", avatar: "SI" },
    location: "本社会議室A",
    status: "scheduled",
  },
  {
    id: "4",
    candidate: { name: "鈴木花子", avatar: "SH", position: "プロダクトマネージャー" },
    type: "技術面接",
    date: new Date("2024-01-20T15:00:00"),
    duration: 60,
    interviewer: { name: "田中次郎", avatar: "TJ" },
    location: "オンライン（Zoom）",
    status: "scheduled",
  },
];

const mockInterviewers = [
  { id: "1", name: "山田太郎", avatar: "YT", department: "開発部" },
  { id: "2", name: "木村由美", avatar: "KY", department: "人事部" },
  { id: "3", name: "佐々木一郎", avatar: "SI", department: "経営企画" },
  { id: "4", name: "田中次郎", avatar: "TJ", department: "開発部" },
];

const interviewTypes = [
  "書類選考",
  "一次面接",
  "技術面接",
  "最終面接",
];

export default function InterviewSchedule() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getInterviewsForDay = (date: Date) => {
    return mockInterviews.filter((interview) =>
      isSameDay(interview.date, date)
    );
  };

  const selectedDayInterviews = getInterviewsForDay(selectedDate);

  const handleSchedule = () => {
    toast.success("面接をスケジュールしました");
    setIsNewDialogOpen(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/recruiting">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">面接スケジュール</h1>
              <p className="text-muted-foreground">
                面接の予定を管理します
              </p>
            </div>
          </div>
          <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                面接を設定
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>面接をスケジュール</DialogTitle>
                <DialogDescription>
                  新しい面接の予定を設定します
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>候補者</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="候補者を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tanaka">田中一郎</SelectItem>
                      <SelectItem value="suzuki">鈴木花子</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>面接タイプ</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="タイプを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {interviewTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>面接官</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="面接官を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockInterviewers.map((interviewer) => (
                        <SelectItem key={interviewer.id} value={interviewer.id}>
                          {interviewer.name}（{interviewer.department}）
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>日付</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>時間</Label>
                    <Input type="time" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>所要時間</Label>
                  <Select defaultValue="60">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30分</SelectItem>
                      <SelectItem value="45">45分</SelectItem>
                      <SelectItem value="60">60分</SelectItem>
                      <SelectItem value="90">90分</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>場所</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="場所を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zoom">オンライン（Zoom）</SelectItem>
                      <SelectItem value="meet">オンライン（Google Meet）</SelectItem>
                      <SelectItem value="office">本社会議室A</SelectItem>
                      <SelectItem value="officeB">本社会議室B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleSchedule}>スケジュール</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <Card>
            <CardContent className="pt-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Week View */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>週間ビュー</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm min-w-[140px] text-center">
                  {format(weekStart, "MM/dd", { locale: ja })} -{" "}
                  {format(weekEnd, "MM/dd", { locale: ja })}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => {
                  const dayInterviews = getInterviewsForDay(day);
                  const isSelected = isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <div
                      key={day.toISOString()}
                      className={`p-2 rounded-lg cursor-pointer transition-colors min-h-[100px] ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : isToday
                          ? "bg-blue-50"
                          : "bg-muted/30 hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div className="text-xs opacity-75">
                        {format(day, "E", { locale: ja })}
                      </div>
                      <div className="font-medium">
                        {format(day, "d", { locale: ja })}
                      </div>
                      {dayInterviews.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {dayInterviews.slice(0, 2).map((interview) => (
                            <div
                              key={interview.id}
                              className={`text-xs p-1 rounded truncate ${
                                isSelected
                                  ? "bg-primary-foreground/20"
                                  : "bg-primary/10"
                              }`}
                            >
                              {format(interview.date, "HH:mm")}
                            </div>
                          ))}
                          {dayInterviews.length > 2 && (
                            <div className="text-xs opacity-75">
                              +{dayInterviews.length - 2}件
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Day Interviews */}
        <Card>
          <CardHeader>
            <CardTitle>
              {format(selectedDate, "MM月dd日（E）", { locale: ja })}の面接
            </CardTitle>
            <CardDescription>
              {selectedDayInterviews.length}件の面接が予定されています
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDayInterviews.length > 0 ? (
              <div className="space-y-4">
                {selectedDayInterviews.map((interview) => (
                  <Card key={interview.id} className="bg-muted/30">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarFallback>
                              {interview.candidate.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {interview.candidate.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {interview.candidate.position}
                            </p>
                            <Badge variant="outline" className="mt-2">
                              {interview.type}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {format(interview.date, "HH:mm", { locale: ja })}
                            <span className="text-muted-foreground">
                              （{interview.duration}分）
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {interview.interviewer.name}
                          </div>
                          <div className="flex items-center gap-1">
                            {interview.location.includes("オンライン") ? (
                              <Video className="h-4 w-4" />
                            ) : (
                              <MapPin className="h-4 w-4" />
                            )}
                            {interview.location}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          詳細
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                この日の面接予定はありません
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
