import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Circle, ChevronRight, BookOpen, Video, FileText, Clock } from "lucide-react";
import { useLessons, useEnrollments, type LmsLesson, type LmsCourse } from "@/hooks/useLMS";
import { useAuth } from "@/hooks/useAuth";

interface CourseLearningViewProps {
  course: LmsCourse;
  onClose: () => void;
}

export function CourseLearningView({ course, onClose }: CourseLearningViewProps) {
  const { lessons, isLoading: lessonsLoading } = useLessons(course.id);
  const { enrollments, enrollUser, updateProgress } = useEnrollments(course.id);
  const { user } = useAuth();
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const userEnrollment = enrollments.find(e => e.user_id === user?.id);
  const currentLesson = lessons[currentLessonIndex];

  // Auto-enroll if not enrolled
  useEffect(() => {
    if (user && !userEnrollment && enrollments.length >= 0) {
      enrollUser.mutateAsync({ userId: user.id, courseId: course.id });
    }
  }, [user, userEnrollment, course.id]);

  const handleCompleteLesson = async () => {
    if (!currentLesson || !userEnrollment) return;

    const newCompleted = new Set(completedLessons);
    newCompleted.add(currentLesson.id);
    setCompletedLessons(newCompleted);

    // Calculate progress
    const newProgress = Math.round((newCompleted.size / lessons.length) * 100);
    await updateProgress.mutateAsync({ id: userEnrollment.id, progress: newProgress });

    // Move to next lesson
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const getContentIcon = (type: string | null) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "pdf":
        return <FileText className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  if (lessonsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  const progress = userEnrollment?.progress || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar - Lesson List */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{course.title}</CardTitle>
            <CardDescription>
              {lessons.length} レッスン
            </CardDescription>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>進捗</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>
          <Separator />
          <ScrollArea className="h-[400px]">
            <div className="p-2">
              {lessons.map((lesson, index) => {
                const isCompleted = completedLessons.has(lesson.id);
                const isCurrent = index === currentLessonIndex;
                
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setCurrentLessonIndex(index)}
                    className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${
                      isCurrent
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className={`shrink-0 ${isCompleted ? "text-primary" : "text-muted-foreground"}`}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{lesson.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        {getContentIcon(lesson.content_type)}
                        {lesson.content_type === "video" ? "動画" : "テキスト"}
                      </p>
                    </div>
                    {isCurrent && <ChevronRight className="h-4 w-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3 space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Badge variant="outline" className="mb-2">
                  レッスン {currentLessonIndex + 1} / {lessons.length}
                </Badge>
                <CardTitle>{currentLesson?.title || "レッスンなし"}</CardTitle>
              </div>
              <Button variant="outline" onClick={onClose}>
                閉じる
              </Button>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            {currentLesson ? (
              <div className="space-y-6">
                {/* Lesson Content */}
                <div className="prose prose-sm max-w-none dark:prose-invert">
                {currentLesson.content_type === "video" && currentLesson.content_url ? (
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <video
                        src={currentLesson.content_url}
                        controls
                        className="w-full h-full rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="bg-muted/50 rounded-lg p-6 min-h-[300px]">
                      <p className="whitespace-pre-wrap">
                        {currentLesson.content_text || "このレッスンにはコンテンツがありません"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentLessonIndex(Math.max(0, currentLessonIndex - 1))}
                    disabled={currentLessonIndex === 0}
                  >
                    前のレッスン
                  </Button>
                  
                  {completedLessons.has(currentLesson.id) ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-4 w-4" />
                      完了済み
                    </Badge>
                  ) : (
                    <Button onClick={handleCompleteLesson}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      完了にする
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => setCurrentLessonIndex(Math.min(lessons.length - 1, currentLessonIndex + 1))}
                    disabled={currentLessonIndex === lessons.length - 1}
                  >
                    次のレッスン
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                このコースにはまだレッスンがありません
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
