import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
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
import { Plus, BookOpen, MoreVertical, Edit, Trash2, Eye, Users, Clock, FileText } from "lucide-react";
import { useCourses, useLessons, useEnrollments } from "@/hooks/useLMS";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export default function Courses() {
  const { courses, isLoading, createCourse, updateCourse, deleteCourse } = useCourses();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<typeof courses[0] | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [isPublished, setIsPublished] = useState(false);

  const handleOpenDialog = (course?: typeof courses[0]) => {
    if (course) {
      setEditingCourse(course);
      setTitle(course.title);
      setDescription(course.description || "");
      setCategory(course.category || "general");
      setIsPublished(course.is_published || false);
    } else {
      setEditingCourse(null);
      setTitle("");
      setDescription("");
      setCategory("general");
      setIsPublished(false);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    
    if (editingCourse) {
      await updateCourse.mutateAsync({
        id: editingCourse.id,
        title,
        description,
        category,
        is_published: isPublished,
      });
    } else {
      await createCourse.mutateAsync({
        title,
        description,
        category,
        is_published: isPublished,
      });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("このコースを削除してもよろしいですか？")) {
      await deleteCourse.mutateAsync(id);
    }
  };

  const getCategoryLabel = (cat: string) => {
    const categories: Record<string, string> = {
      general: "一般",
      onboarding: "オンボーディング",
      compliance: "コンプライアンス",
      skills: "スキル",
      product: "製品知識",
    };
    return categories[cat] || cat;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BookOpen className="h-8 w-8" />
              コース管理
            </h1>
            <p className="text-muted-foreground">研修・教育コースの作成と管理</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                新規コース
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCourse ? "コース編集" : "新規コース作成"}</DialogTitle>
                <DialogDescription>
                  コースの基本情報を入力してください
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">タイトル *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="コースタイトル"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">説明</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="コースの説明"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">カテゴリ</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">一般</SelectItem>
                      <SelectItem value="onboarding">オンボーディング</SelectItem>
                      <SelectItem value="compliance">コンプライアンス</SelectItem>
                      <SelectItem value="skills">スキル</SelectItem>
                      <SelectItem value="product">製品知識</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>公開する</Label>
                    <p className="text-sm text-muted-foreground">受講者がコースを閲覧できるようにします</p>
                  </div>
                  <Switch checked={isPublished} onCheckedChange={setIsPublished} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleSubmit} disabled={!title.trim()}>
                  {editingCourse ? "更新" : "作成"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>総コース数</CardDescription>
              <CardTitle className="text-2xl">{courses.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>公開中</CardDescription>
              <CardTitle className="text-2xl">{courses.filter(c => c.is_published).length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>下書き</CardDescription>
              <CardTitle className="text-2xl">{courses.filter(c => !c.is_published).length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>カテゴリ数</CardDescription>
              <CardTitle className="text-2xl">{new Set(courses.map(c => c.category)).size}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Course List */}
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              読み込み中...
            </CardContent>
          </Card>
        ) : courses.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              コースがまだありません。新規コースを作成してください。
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description || "説明なし"}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(course)}>
                          <Edit className="h-4 w-4 mr-2" />
                          編集
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedCourse(course.id)}>
                          <FileText className="h-4 w-4 mr-2" />
                          レッスン管理
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(course.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant={course.is_published ? "default" : "secondary"}>
                      {course.is_published ? "公開中" : "下書き"}
                    </Badge>
                    <Badge variant="outline">{getCategoryLabel(course.category || "general")}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    作成日: {format(new Date(course.created_at), "yyyy/MM/dd", { locale: ja })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Lesson Management Dialog */}
        {selectedCourse && (
          <LessonManagementDialog
            courseId={selectedCourse}
            courseName={courses.find(c => c.id === selectedCourse)?.title || ""}
            open={!!selectedCourse}
            onOpenChange={(open) => !open && setSelectedCourse(null)}
          />
        )}
      </div>
    </AppLayout>
  );
}

// Lesson Management Dialog Component
function LessonManagementDialog({
  courseId,
  courseName,
  open,
  onOpenChange,
}: {
  courseId: string;
  courseName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { lessons, isLoading, createLesson, updateLesson, deleteLesson } = useLessons(courseId);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [contentType, setContentType] = useState("text");

  const handleAddLesson = async () => {
    if (!lessonTitle.trim()) return;
    await createLesson.mutateAsync({
      course_id: courseId,
      title: lessonTitle,
      content_type: contentType,
      content_text: lessonContent,
      sort_order: lessons.length,
    });
    setLessonTitle("");
    setLessonContent("");
    setIsAddingLesson(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>レッスン管理: {courseName}</DialogTitle>
          <DialogDescription>
            コースのレッスンを追加・編集できます
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-4">読み込み中...</p>
          ) : lessons.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">レッスンがまだありません</p>
          ) : (
            <div className="space-y-2">
              {lessons.map((lesson, index) => (
                <Card key={lesson.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{lesson.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {lesson.content_type === "video" ? "動画" : "テキスト"}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deleteLesson.mutateAsync(lesson.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {isAddingLesson ? (
            <Card className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>レッスンタイトル</Label>
                <Input
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="レッスンタイトル"
                />
              </div>
              <div className="space-y-2">
                <Label>コンテンツタイプ</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">テキスト</SelectItem>
                    <SelectItem value="video">動画</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>コンテンツ</Label>
                <Textarea
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  placeholder="レッスンの内容"
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsAddingLesson(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleAddLesson}>追加</Button>
              </div>
            </Card>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => setIsAddingLesson(true)}>
              <Plus className="h-4 w-4 mr-2" />
              レッスンを追加
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
