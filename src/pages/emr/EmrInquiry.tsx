import { useState } from "react";
import { format } from "date-fns";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ClipboardList, Copy, ExternalLink, FileText, Plus, Trash2 } from "lucide-react";
import { useEmrInquiryTemplates, useEmrInquiryResponses, InquiryQuestion } from "@/hooks/emr/useEmrInquiry";
import { toast } from "sonner";

const questionTypes = [
  { value: "text", label: "テキスト（1行）" },
  { value: "textarea", label: "テキスト（複数行）" },
  { value: "radio", label: "単一選択" },
  { value: "checkbox", label: "複数選択" },
  { value: "select", label: "ドロップダウン" },
];

export default function EmrInquiry() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });
  const [questions, setQuestions] = useState<InquiryQuestion[]>([]);
  const [newQuestion, setNewQuestion] = useState<Partial<InquiryQuestion>>({
    type: "text",
    question: "",
    required: true,
    options: [],
  });
  const [optionInput, setOptionInput] = useState("");

  const { templates, isLoading, createTemplate, deleteTemplate } = useEmrInquiryTemplates();
  const { responses } = useEmrInquiryResponses();

  const addQuestion = () => {
    if (!newQuestion.question) return;
    setQuestions([
      ...questions,
      {
        id: crypto.randomUUID(),
        type: newQuestion.type as InquiryQuestion["type"],
        question: newQuestion.question,
        required: newQuestion.required ?? true,
        options: newQuestion.options,
      },
    ]);
    setNewQuestion({ type: "text", question: "", required: true, options: [] });
    setOptionInput("");
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const addOption = () => {
    if (!optionInput.trim()) return;
    setNewQuestion({
      ...newQuestion,
      options: [...(newQuestion.options || []), optionInput.trim()],
    });
    setOptionInput("");
  };

  const handleSubmit = async () => {
    if (!formData.name || questions.length === 0) return;
    await createTemplate.mutateAsync({
      name: formData.name,
      description: formData.description || null,
      questions,
      is_active: formData.is_active,
      updated_at: new Date().toISOString(),
    });
    setDialogOpen(false);
    setFormData({ name: "", description: "", is_active: true });
    setQuestions([]);
  };

  const copyPublicUrl = (templateId: string) => {
    const url = `${window.location.origin}/inquiry/${templateId}`;
    navigator.clipboard.writeText(url);
    toast.success("URLをコピーしました");
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Web問診</h1>
            <p className="text-muted-foreground">問診テンプレート管理・回答確認</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />テンプレート作成</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>問診テンプレート作成</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>テンプレート名</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="例: 初診用問診票" />
                  </div>
                  <div>
                    <Label>説明</Label>
                    <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="問診票の説明（任意）" rows={2} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={formData.is_active} onCheckedChange={(v) => setFormData({ ...formData, is_active: v })} />
                    <Label>有効にする</Label>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Label className="text-lg">質問項目</Label>
                  
                  {/* Existing Questions */}
                  <div className="space-y-2 mt-4">
                    {questions.map((q, idx) => (
                      <Card key={q.id}>
                        <CardContent className="p-3 flex items-center justify-between">
                          <div>
                            <p className="font-medium">{idx + 1}. {q.question}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{questionTypes.find((t) => t.value === q.type)?.label}</Badge>
                              {q.required && <Badge variant="secondary">必須</Badge>}
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeQuestion(q.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Add New Question */}
                  <Card className="mt-4">
                    <CardContent className="p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>質問タイプ</Label>
                          <Select value={newQuestion.type} onValueChange={(v) => setNewQuestion({ ...newQuestion, type: v as InquiryQuestion["type"], options: [] })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {questionTypes.map((t) => (
                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                          <Switch checked={newQuestion.required} onCheckedChange={(v) => setNewQuestion({ ...newQuestion, required: v })} />
                          <Label>必須</Label>
                        </div>
                      </div>
                      <div>
                        <Label>質問文</Label>
                        <Input value={newQuestion.question} onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })} placeholder="質問を入力" />
                      </div>
                      
                      {["radio", "checkbox", "select"].includes(newQuestion.type || "") && (
                        <div>
                          <Label>選択肢</Label>
                          <div className="flex gap-2">
                            <Input value={optionInput} onChange={(e) => setOptionInput(e.target.value)} placeholder="選択肢を追加" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addOption())} />
                            <Button type="button" variant="outline" onClick={addOption}>追加</Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {newQuestion.options?.map((opt, i) => (
                              <Badge key={i} variant="secondary">
                                {opt}
                              <button className="ml-1" onClick={() => setNewQuestion({ ...newQuestion, options: newQuestion.options?.filter((_, idx) => idx !== i) })}>&times;</button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button type="button" variant="outline" onClick={addQuestion} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />質問を追加
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Button onClick={handleSubmit} disabled={!formData.name || questions.length === 0} className="w-full">
                  テンプレートを保存
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="templates">
          <TabsList>
            <TabsTrigger value="templates">テンプレート</TabsTrigger>
            <TabsTrigger value="responses">回答一覧</TabsTrigger>
          </TabsList>

          <TabsContent value="templates">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>問診テンプレートがありません</p>
                    <p className="text-sm">「テンプレート作成」から作成してください</p>
                  </CardContent>
                </Card>
              ) : (
                templates.map((t) => (
                  <Card key={t.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{t.name}</CardTitle>
                          {t.description && <CardDescription>{t.description}</CardDescription>}
                        </div>
                        <Badge variant={t.is_active ? "default" : "secondary"}>
                          {t.is_active ? "有効" : "無効"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {t.questions.length}問
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => copyPublicUrl(t.id)}>
                          <Copy className="h-4 w-4 mr-1" />URL
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <a href={`/inquiry/${t.id}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />プレビュー
                          </a>
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteTemplate.mutate(t.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="responses">
            <Card>
              <CardContent className="p-0">
                {responses.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>回答がありません</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {responses.map((r) => (
                      <div key={r.id} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">{r.patient?.name || "未登録患者"}</p>
                            <p className="text-sm text-muted-foreground">
                              {r.template?.name} • {format(new Date(r.submitted_at), "yyyy/MM/dd HH:mm")}
                            </p>
                          </div>
                          <Badge variant="outline">{r.patient?.patient_number || "新規"}</Badge>
                        </div>
                        <div className="bg-muted rounded-md p-3 text-sm">
                          <pre className="whitespace-pre-wrap">{JSON.stringify(r.responses, null, 2)}</pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
