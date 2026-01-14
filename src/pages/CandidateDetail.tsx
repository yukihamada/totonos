import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Star,
  Download,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { toast } from "sonner";

// Mock data
const mockCandidate = {
  id: "1",
  name: "田中一郎",
  email: "tanaka@example.com",
  phone: "090-1234-5678",
  location: "東京都渋谷区",
  position: "フロントエンドエンジニア",
  status: "interview",
  stage: "技術面接",
  source: "LinkedIn",
  rating: 4,
  appliedAt: new Date("2024-01-14"),
  avatar: "TI",
  resumeUrl: "/resumes/tanaka.pdf",
  portfolioUrl: "https://tanaka-portfolio.com",
  linkedIn: "https://linkedin.com/in/tanaka",
  currentCompany: "株式会社ABC",
  currentPosition: "フロントエンドエンジニア",
  yearsOfExperience: 5,
  expectedSalary: "700万円〜800万円",
  availableDate: new Date("2024-03-01"),
  skills: ["React", "TypeScript", "Next.js", "Node.js", "GraphQL"],
  notes: "技術力が高く、コミュニケーションも良好。チームリードの経験あり。",
};

const mockEvaluations = [
  {
    id: "1",
    interviewer: "山田太郎",
    type: "一次面接",
    date: new Date("2024-01-16"),
    rating: 4,
    decision: "pass",
    feedback:
      "技術力は申し分なし。コミュニケーションも良好で、チームに馴染めそう。次の技術面接に進めて問題ないと判断。",
    strengths: ["技術力", "コミュニケーション", "問題解決力"],
    concerns: ["リーダーシップ経験がやや少ない"],
  },
];

const mockActivities = [
  {
    id: "1",
    type: "stage_change",
    content: "ステージを「技術面接」に変更",
    user: "山田太郎",
    date: new Date("2024-01-16T15:00:00"),
  },
  {
    id: "2",
    type: "evaluation",
    content: "一次面接の評価を登録",
    user: "山田太郎",
    date: new Date("2024-01-16T14:30:00"),
  },
  {
    id: "3",
    type: "interview",
    content: "一次面接を実施",
    user: "山田太郎",
    date: new Date("2024-01-16T10:00:00"),
  },
  {
    id: "4",
    type: "screening",
    content: "書類選考を通過",
    user: "佐藤花子",
    date: new Date("2024-01-15T09:00:00"),
  },
  {
    id: "5",
    type: "application",
    content: "応募を受付",
    user: "システム",
    date: new Date("2024-01-14T08:00:00"),
  },
];

const stages = [
  "書類選考",
  "一次面接",
  "技術面接",
  "最終面接",
  "内定",
  "入社",
];

export default function CandidateDetail() {
  const { id } = useParams();
  const [newNote, setNewNote] = useState("");
  const [selectedStage, setSelectedStage] = useState(mockCandidate.stage);

  const candidate = mockCandidate;

  const handleStageChange = (stage: string) => {
    setSelectedStage(stage);
    toast.success(`ステージを「${stage}」に変更しました`);
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      toast.success("メモを追加しました");
      setNewNote("");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/candidates">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl">{candidate.avatar}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{candidate.name}</h1>
              <p className="text-muted-foreground">{candidate.position}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-blue-500 text-white">{candidate.stage}</Badge>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < candidate.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedStage} onValueChange={handleStageChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              面接を設定
            </Button>
            <Button>
              <Mail className="h-4 w-4 mr-2" />
              メール送信
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="profile" className="space-y-4">
              <TabsList>
                <TabsTrigger value="profile">プロフィール</TabsTrigger>
                <TabsTrigger value="evaluations">評価</TabsTrigger>
                <TabsTrigger value="activity">活動履歴</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                {/* Contact Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">連絡先</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${candidate.email}`}
                        className="text-primary hover:underline"
                      >
                        {candidate.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{candidate.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{candidate.location}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Professional Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">職歴</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">現職</p>
                        <p className="font-medium">{candidate.currentCompany}</p>
                        <p className="text-sm">{candidate.currentPosition}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">経験年数</p>
                        <p className="font-medium">{candidate.yearsOfExperience}年</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">希望年収</p>
                        <p className="font-medium">{candidate.expectedSalary}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">入社可能日</p>
                        <p className="font-medium">
                          {format(candidate.availableDate, "yyyy年MM月", { locale: ja })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">スキル</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Documents */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">書類</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      履歴書
                      <Download className="h-4 w-4 ml-auto" />
                    </Button>
                    {candidate.portfolioUrl && (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        asChild
                      >
                        <a
                          href={candidate.portfolioUrl}
                          target="_blank"
                          rel="noopener"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          ポートフォリオ
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="evaluations" className="space-y-4">
                {mockEvaluations.length > 0 ? (
                  mockEvaluations.map((evaluation) => (
                    <Card key={evaluation.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">
                              {evaluation.type}
                            </CardTitle>
                            <CardDescription>
                              {evaluation.interviewer} •{" "}
                              {format(evaluation.date, "yyyy/MM/dd", { locale: ja })}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < evaluation.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <Badge
                              className={`${
                                evaluation.decision === "pass"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              } text-white`}
                            >
                              {evaluation.decision === "pass" ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  通過
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  不通過
                                </>
                              )}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm">{evaluation.feedback}</p>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-sm font-medium mb-2">強み</p>
                            <div className="flex flex-wrap gap-1">
                              {evaluation.strengths.map((s) => (
                                <Badge key={s} variant="outline" className="text-green-600">
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">懸念点</p>
                            <div className="flex flex-wrap gap-1">
                              {evaluation.concerns.map((c) => (
                                <Badge key={c} variant="outline" className="text-yellow-600">
                                  {c}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="p-8">
                    <div className="text-center text-muted-foreground">
                      まだ評価がありません
                    </div>
                  </Card>
                )}
                <Button className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  評価を追加
                </Button>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      {mockActivities.map((activity, index) => (
                        <div key={activity.id} className="relative">
                          {index < mockActivities.length - 1 && (
                            <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border" />
                          )}
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm">{activity.content}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {activity.user} •{" "}
                                {format(activity.date, "MM/dd HH:mm", { locale: ja })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">基本情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">応募日</span>
                  <span className="text-sm">
                    {format(candidate.appliedAt, "yyyy/MM/dd", { locale: ja })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">流入元</span>
                  <span className="text-sm">{candidate.source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">ポジション</span>
                  <span className="text-sm">{candidate.position}</span>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">メモ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {candidate.notes && (
                  <p className="text-sm bg-muted p-3 rounded">
                    {candidate.notes}
                  </p>
                )}
                <div className="flex gap-2">
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="メモを追加..."
                    rows={3}
                  />
                </div>
                <Button size="sm" onClick={handleAddNote} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  追加
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
