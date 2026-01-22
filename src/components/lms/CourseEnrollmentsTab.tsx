import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Users, Search, Mail, Calendar, TrendingUp } from "lucide-react";
import { useEnrollments, type LmsEnrollment } from "@/hooks/useLMS";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface CourseEnrollmentsTabProps {
  courseId: string;
  courseName: string;
}

export function CourseEnrollmentsTab({ courseId, courseName }: CourseEnrollmentsTabProps) {
  const { enrollments, isLoading, enrollUser, updateProgress } = useEnrollments(courseId);
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<LmsEnrollment | null>(null);

  const courseEnrollments = enrollments.filter(e => e.course_id === courseId);
  const filteredEnrollments = courseEnrollments.filter(e =>
    e.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const completedCount = courseEnrollments.filter(e => e.completed_at).length;
  const inProgressCount = courseEnrollments.filter(e => !e.completed_at && (e.progress || 0) > 0).length;
  const avgProgress = courseEnrollments.length > 0
    ? Math.round(courseEnrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / courseEnrollments.length)
    : 0;

  const handleEnrollSelf = async () => {
    if (!user) return;
    await enrollUser.mutateAsync({ userId: user.id, courseId });
    setIsEnrollDialogOpen(false);
  };

  const handleUpdateProgress = async (enrollmentId: string, newProgress: number) => {
    await updateProgress.mutateAsync({ id: enrollmentId, progress: newProgress });
    setSelectedEnrollment(null);
  };

  const isUserEnrolled = user && courseEnrollments.some(e => e.user_id === user.id);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              総受講者数
            </CardDescription>
            <CardTitle className="text-2xl">{courseEnrollments.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>完了者</CardDescription>
            <CardTitle className="text-2xl text-primary">{completedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>進行中</CardDescription>
            <CardTitle className="text-2xl">{inProgressCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              平均進捗
            </CardDescription>
            <CardTitle className="text-2xl">{avgProgress}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Actions & Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="受講者を検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {!isUserEnrolled && (
          <Button onClick={() => setIsEnrollDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            このコースに登録
          </Button>
        )}
      </div>

      {/* Enrollments Table */}
      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            読み込み中...
          </CardContent>
        </Card>
      ) : filteredEnrollments.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            受講者がまだいません
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>受講者ID</TableHead>
                <TableHead>開始日</TableHead>
                <TableHead>進捗</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>完了日</TableHead>
                <TableHead className="text-right">アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnrollments.map((enrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell className="font-mono text-sm">
                    {enrollment.user_id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(enrollment.started_at), "yyyy/MM/dd", { locale: ja })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-32 space-y-1">
                      <Progress value={enrollment.progress || 0} className="h-2" />
                      <span className="text-xs text-muted-foreground">{enrollment.progress || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={enrollment.completed_at ? "default" : "secondary"}>
                      {enrollment.completed_at ? "完了" : "進行中"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {enrollment.completed_at
                      ? format(new Date(enrollment.completed_at), "yyyy/MM/dd", { locale: ja })
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedEnrollment(enrollment)}
                    >
                      進捗更新
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Self Enroll Dialog */}
      <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>コースに登録</DialogTitle>
            <DialogDescription>
              「{courseName}」に受講登録しますか？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEnrollDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleEnrollSelf}>登録する</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Progress Dialog */}
      <Dialog open={!!selectedEnrollment} onOpenChange={() => setSelectedEnrollment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>進捗を更新</DialogTitle>
            <DialogDescription>
              新しい進捗率を選択してください
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-2 py-4">
            {[25, 50, 75, 100].map((value) => (
              <Button
                key={value}
                variant={selectedEnrollment?.progress === value ? "default" : "outline"}
                onClick={() => selectedEnrollment && handleUpdateProgress(selectedEnrollment.id, value)}
              >
                {value}%
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
