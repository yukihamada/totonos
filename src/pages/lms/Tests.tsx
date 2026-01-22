import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { Plus, ClipboardList, MoreVertical, Edit, Trash2, Play, FileText, CheckCircle, XCircle } from "lucide-react";
import { useTests, useQuestions, useCourses, useTestResults } from "@/hooks/useLMS";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { Json } from "@/integrations/supabase/types";

export default function Tests() {
  const { tests, isLoading, createTest, updateTest, deleteTest } = useTests();
  const { courses } = useCourses();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<typeof tests[0] | null>(null);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [takingTest, setTakingTest] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState<string>("");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(30);
  const [passScore, setPassScore] = useState(60);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [isPublished, setIsPublished] = useState(false);

  const handleOpenDialog = (test?: typeof tests[0]) => {
    if (test) {
      setEditingTest(test);
      setTitle(test.title);
      setDescription(test.description || "");
      setCourseId(test.course_id || "");
      setTimeLimitMinutes(test.time_limit_minutes || 30);
      setPassScore(test.pass_score || 60);
      setMaxAttempts(test.max_attempts || 3);
      setIsPublished(test.is_published || false);
    } else {
      setEditingTest(null);
      setTitle("");
      setDescription("");
      setCourseId("");
      setTimeLimitMinutes(30);
      setPassScore(60);
      setMaxAttempts(3);
      setIsPublished(false);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    
    if (editingTest) {
      await updateTest.mutateAsync({
        id: editingTest.id,
        title,
        description,
        course_id: courseId || null,
        time_limit_minutes: timeLimitMinutes,
        pass_score: passScore,
        max_attempts: maxAttempts,
        is_published: isPublished,
      });
    } else {
      await createTest.mutateAsync({
        title,
        description,
        course_id: courseId || undefined,
        time_limit_minutes: timeLimitMinutes,
        pass_score: passScore,
        max_attempts: maxAttempts,
      });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("このテストを削除してもよろしいですか？")) {
      await deleteTest.mutateAsync(id);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ClipboardList className="h-8 w-8" />
              テスト・試験
            </h1>
            <p className="text-muted-foreground">テストの作成と受験結果の管理</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                新規テスト
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTest ? "テスト編集" : "新規テスト作成"}</DialogTitle>
                <DialogDescription>
                  テストの基本情報を入力してください
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">タイトル *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="テストタイトル"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">説明</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="テストの説明"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course">関連コース（任意）</Label>
                  <Select value={courseId} onValueChange={setCourseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">なし</SelectItem>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>制限時間（分）</Label>
                    <Input
                      type="number"
                      value={timeLimitMinutes}
                      onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                      min={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>合格点（%）</Label>
                    <Input
                      type="number"
                      value={passScore}
                      onChange={(e) => setPassScore(Number(e.target.value))}
                      min={0}
                      max={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>最大受験回数</Label>
                    <Input
                      type="number"
                      value={maxAttempts}
                      onChange={(e) => setMaxAttempts(Number(e.target.value))}
                      min={1}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>公開する</Label>
                    <p className="text-sm text-muted-foreground">受験者がテストを受けられるようにします</p>
                  </div>
                  <Switch checked={isPublished} onCheckedChange={setIsPublished} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleSubmit} disabled={!title.trim()}>
                  {editingTest ? "更新" : "作成"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>総テスト数</CardDescription>
              <CardTitle className="text-2xl">{tests.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>公開中</CardDescription>
              <CardTitle className="text-2xl">{tests.filter(t => t.is_published).length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>下書き</CardDescription>
              <CardTitle className="text-2xl">{tests.filter(t => !t.is_published).length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>コース連携</CardDescription>
              <CardTitle className="text-2xl">{tests.filter(t => t.course_id).length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Test List */}
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              読み込み中...
            </CardContent>
          </Card>
        ) : tests.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              テストがまだありません。新規テストを作成してください。
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tests.map((test) => (
              <Card key={test.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="line-clamp-1">{test.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {test.description || "説明なし"}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(test)}>
                          <Edit className="h-4 w-4 mr-2" />
                          編集
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedTest(test.id)}>
                          <FileText className="h-4 w-4 mr-2" />
                          問題管理
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTakingTest(test.id)}>
                          <Play className="h-4 w-4 mr-2" />
                          受験する
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(test.id)}
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
                    <Badge variant={test.is_published ? "default" : "secondary"}>
                      {test.is_published ? "公開中" : "下書き"}
                    </Badge>
                    <Badge variant="outline">{test.time_limit_minutes}分</Badge>
                    <Badge variant="outline">合格{test.pass_score}%</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    作成日: {format(new Date(test.created_at), "yyyy/MM/dd", { locale: ja })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Question Management Dialog */}
        {selectedTest && (
          <QuestionManagementDialog
            testId={selectedTest}
            testName={tests.find(t => t.id === selectedTest)?.title || ""}
            open={!!selectedTest}
            onOpenChange={(open) => !open && setSelectedTest(null)}
          />
        )}

        {/* Take Test Dialog */}
        {takingTest && (
          <TakeTestDialog
            testId={takingTest}
            test={tests.find(t => t.id === takingTest)!}
            open={!!takingTest}
            onOpenChange={(open) => !open && setTakingTest(null)}
          />
        )}
      </div>
    </AppLayout>
  );
}

// Question Management Dialog
function QuestionManagementDialog({
  testId,
  testName,
  open,
  onOpenChange,
}: {
  testId: string;
  testName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { questions, isLoading, createQuestion, deleteQuestion } = useQuestions(testId);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("single_choice");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [points, setPoints] = useState(1);

  const handleAddQuestion = async () => {
    if (!questionText.trim()) return;
    
    const filteredOptions = options.filter(o => o.trim());
    
    await createQuestion.mutateAsync({
      test_id: testId,
      question_text: questionText,
      question_type: questionType,
      options: filteredOptions as unknown as Json,
      correct_answer: correctAnswer as unknown as Json,
      points,
      sort_order: questions.length,
    });
    
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer(0);
    setIsAddingQuestion(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>問題管理: {testName}</DialogTitle>
          <DialogDescription>
            テストの問題を追加・編集できます
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-4">読み込み中...</p>
          ) : questions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">問題がまだありません</p>
          ) : (
            <div className="space-y-2">
              {questions.map((question, index) => (
                <Card key={question.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{question.question_text}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {question.points}点 • {question.question_type === "single_choice" ? "単一選択" : "複数選択"}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deleteQuestion.mutateAsync(question.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {isAddingQuestion ? (
            <Card className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>問題文 *</Label>
                <Textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="問題文を入力"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>問題タイプ</Label>
                  <Select value={questionType} onValueChange={setQuestionType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single_choice">単一選択</SelectItem>
                      <SelectItem value="multiple_choice">複数選択</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>配点</Label>
                  <Input
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    min={1}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>選択肢</Label>
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <RadioGroup value={String(correctAnswer)} onValueChange={(v) => setCorrectAnswer(Number(v))}>
                      <RadioGroupItem value={String(index)} />
                    </RadioGroup>
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[index] = e.target.value;
                        setOptions(newOptions);
                      }}
                      placeholder={`選択肢 ${index + 1}`}
                    />
                  </div>
                ))}
                <p className="text-sm text-muted-foreground">ラジオボタンで正解を選択してください</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsAddingQuestion(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleAddQuestion}>追加</Button>
              </div>
            </Card>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => setIsAddingQuestion(true)}>
              <Plus className="h-4 w-4 mr-2" />
              問題を追加
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Take Test Dialog
function TakeTestDialog({
  testId,
  test,
  open,
  onOpenChange,
}: {
  testId: string;
  test: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { questions } = useQuestions(testId);
  const { submitResult } = useTestResults();
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; maxScore: number; passed: boolean } | null>(null);

  const handleAnswer = (questionId: string, answerIndex: number) => {
    setAnswers({ ...answers, [questionId]: answerIndex });
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    let score = 0;
    let maxScore = 0;
    
    questions.forEach((q) => {
      maxScore += q.points || 1;
      if (answers[q.id] === q.correct_answer) {
        score += q.points || 1;
      }
    });
    
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const passed = percentage >= (test.pass_score || 60);
    
    await submitResult.mutateAsync({
      testId,
      userId: user.id,
      answers,
      score,
      maxScore,
      passed,
    });
    
    setResult({ score, maxScore, passed });
    setSubmitted(true);
  };

  if (questions.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{test.title}</DialogTitle>
          </DialogHeader>
          <p className="text-center text-muted-foreground py-8">
            このテストには問題がまだ登録されていません
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  if (submitted && result) {
    const percentage = Math.round((result.score / result.maxScore) * 100);
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>テスト結果</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4 py-6">
            {result.passed ? (
              <CheckCircle className="h-16 w-16 text-primary mx-auto" />
            ) : (
              <XCircle className="h-16 w-16 text-destructive mx-auto" />
            )}
            <div>
              <p className="text-4xl font-bold">{percentage}%</p>
              <p className="text-muted-foreground">
                {result.score} / {result.maxScore} 点
              </p>
            </div>
            <Badge variant={result.passed ? "default" : "destructive"} className="text-lg px-4 py-1">
              {result.passed ? "合格" : "不合格"}
            </Badge>
            <p className="text-sm text-muted-foreground">
              合格基準: {test.pass_score}%以上
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>閉じる</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const question = questions[currentQuestion];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{test.title}</DialogTitle>
          <DialogDescription>
            問題 {currentQuestion + 1} / {questions.length}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card className="p-4">
            <p className="font-medium mb-4">{question.question_text}</p>
            <RadioGroup
              value={String(answers[question.id] ?? -1)}
              onValueChange={(v) => handleAnswer(question.id, Number(v))}
            >
              {(question.options as string[] || []).map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 rounded hover:bg-muted">
                  <RadioGroupItem value={String(index)} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </Card>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
              disabled={currentQuestion === 0}
            >
              前へ
            </Button>
            {currentQuestion === questions.length - 1 ? (
              <Button onClick={handleSubmit}>提出する</Button>
            ) : (
              <Button onClick={() => setCurrentQuestion(currentQuestion + 1)}>
                次へ
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
