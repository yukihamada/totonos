import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Mail, 
  MessageSquare, 
  Bot, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Send,
  Reply,
  FileText,
  Calculator,
  Users,
  Target,
  Clock,
  Smartphone,
  Settings,
  X,
  Receipt,
  Building2,
  Copy,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

const STORAGE_KEY = "totonos-getting-started-dismissed";
const COMPLETED_STEPS_KEY = "totonos-tutorial-completed-steps";

export default function GettingStarted() {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    const isDismissed = localStorage.getItem(STORAGE_KEY) === "true";
    setDismissed(isDismissed);
    
    const saved = localStorage.getItem(COMPLETED_STEPS_KEY);
    if (saved) {
      setCompletedSteps(JSON.parse(saved));
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
    navigate("/dashboard");
  };

  const toggleStep = (stepId: string) => {
    const newCompleted = completedSteps.includes(stepId)
      ? completedSteps.filter(id => id !== stepId)
      : [...completedSteps, stepId];
    
    setCompletedSteps(newCompleted);
    localStorage.setItem(COMPLETED_STEPS_KEY, JSON.stringify(newCompleted));
  };

  const resetProgress = () => {
    setCompletedSteps([]);
    localStorage.removeItem(COMPLETED_STEPS_KEY);
    localStorage.removeItem(STORAGE_KEY);
    setDismissed(false);
  };

  const copyEmailAddress = () => {
    navigator.clipboard.writeText("minato@totos.jp");
    toast.success("メールアドレスをコピーしました");
  };

  if (dismissed) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">初めての方へ</h1>
          </div>
          
          <Card className="border-2">
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="h-16 w-16 mx-auto text-chart-2 mb-4" />
              <h2 className="text-2xl font-bold mb-2">チュートリアル完了！</h2>
              <p className="text-muted-foreground mb-6">
                お疲れ様でした。いつでもこのページからガイドを再度確認できます。
              </p>
              <Button onClick={resetProgress} variant="outline">
                チュートリアルをリセット
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const emailExamples = [
    { command: "株式会社ABCへ10万円の請求書を作成して", result: "クライアント情報から請求書を自動生成" },
    { command: "山田商事との業務委託契約書を作成", result: "テンプレートから契約書を生成" },
    { command: "今月の売上を教えて", result: "当月の請求書・入金データを集計してレポート" },
    { command: "来週の予定を確認", result: "活動・商談のスケジュールをまとめて返信" },
  ];

  const lineExamples = [
    { command: "新しいリードを登録 田中太郎 株式会社XYZ", result: "リードを即座に登録" },
    { command: "今日の売上", result: "本日の売上サマリーを返信" },
    { command: "経費を登録 3000円 タクシー代", result: "経費申請を自動登録" },
    { command: "契約書を送付して", result: "指定の契約書を相手先にメール送信" },
  ];

  const chatExamples = [
    { command: "株式会社BUTTIを登録して、15万円の清掃代の請求書を作成", result: "会社登録→請求書作成を一括で実行" },
    { command: "今期の売上予測を見せて", result: "パイプラインから売上予測を表示" },
    { command: "田中さんとの商談履歴", result: "関連する活動・メモを時系列で表示" },
    { command: "Wikiに議事録を追加", result: "会議メモをナレッジベースに保存" },
  ];

  const allSteps = [
    "email-intro", "email-examples", 
    "line-intro", "line-examples",
    "chat-intro", "chat-examples"
  ];
  
  const progress = Math.round((completedSteps.length / allSteps.length) * 100);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              初めての方へ
            </h1>
            <p className="text-muted-foreground mt-1">
              Totonos AIアシスタント「ミナト」の使い方をマスターしましょう
            </p>
          </div>
          <Button variant="outline" onClick={handleDismiss}>
            <X className="h-4 w-4 mr-2" />
            今後表示しない
          </Button>
        </div>

        {/* Progress */}
        <Card className="border-2">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">学習進捗</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="border-2 border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              便利な使い方のヒント
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">会社（クライアント）を先に登録</p>
                <p className="text-sm text-muted-foreground">
                  請求書や契約書を作成する前に、取引先の会社を登録しておくとスムーズに作成できます。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Receipt className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">領収書の画像を添付で自動経費登録</p>
                <p className="text-sm text-muted-foreground">
                  メールに領収書の画像を添付して送ると、AIがOCRで読み取って自動で経費として登録します。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Section */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle>メールで操作</CardTitle>
                  <Badge variant="secondary">おすすめ</Badge>
                </div>
                <CardDescription className="mt-1">
                  以下のメールアドレスに送信するだけで、様々な業務を実行できます
                </CardDescription>
              </div>
              <Checkbox 
                checked={completedSteps.includes("email-intro")}
                onCheckedChange={() => toggleStep("email-intro")}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Send className="h-4 w-4" />
                専用メールアドレスに送信
              </div>
              <div className="flex items-center gap-2">
                <code className="px-3 py-2 bg-background border rounded text-sm font-mono">
                  minato@totos.jp
                </code>
                <Button variant="ghost" size="sm" onClick={copyEmailAddress}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Reply className="h-4 w-4" />
                自然言語で指示するだけでAIが処理を実行
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">コマンド例</h4>
                <Checkbox 
                  checked={completedSteps.includes("email-examples")}
                  onCheckedChange={() => toggleStep("email-examples")}
                />
              </div>
              <div className="grid gap-2">
                {emailExamples.map((example, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-card border rounded-lg">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <div>
                      <p className="font-medium text-sm">「{example.command}」</p>
                      <p className="text-xs text-muted-foreground">{example.result}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LINE Section */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-chart-2/10">
                <MessageSquare className="h-6 w-6 text-chart-2" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle>LINEで操作</CardTitle>
                  <Badge className="bg-chart-2 text-background">NEW</Badge>
                </div>
                <CardDescription className="mt-1">
                  外出先でもLINEから全機能にアクセス。いつでもどこでも業務を完結
                </CardDescription>
              </div>
              <Checkbox 
                checked={completedSteps.includes("line-intro")}
                onCheckedChange={() => toggleStep("line-intro")}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-chart-2/5 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Smartphone className="h-4 w-4" />
                LINE公式アカウントを友だち追加
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Settings className="h-4 w-4" />
                アプリ内でLINE連携を設定
              </div>
              <Link to="/settings/line">
                <Button variant="outline" size="sm" className="mt-2">
                  LINE設定を開く
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">コマンド例</h4>
                <Checkbox 
                  checked={completedSteps.includes("line-examples")}
                  onCheckedChange={() => toggleStep("line-examples")}
                />
              </div>
              <div className="grid gap-2">
                {lineExamples.map((example, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-card border rounded-lg">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-chart-2 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">「{example.command}」</p>
                      <p className="text-xs text-muted-foreground">{example.result}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Chat Section */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-accent">
                <Bot className="h-6 w-6 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <CardTitle>アプリ内AIチャット</CardTitle>
                <CardDescription className="mt-1">
                  右下のチャットボタンからミナトと会話。データの確認から登録まで対話で完結
                </CardDescription>
              </div>
              <Checkbox 
                checked={completedSteps.includes("chat-intro")}
                onCheckedChange={() => toggleStep("chat-intro")}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-accent/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Bot className="h-4 w-4" />
                画面右下のチャットアイコンをクリック
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4" />
                自然言語で指示するだけでデータを操作
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">コマンド例</h4>
                <Checkbox 
                  checked={completedSteps.includes("chat-examples")}
                  onCheckedChange={() => toggleStep("chat-examples")}
                />
              </div>
              <div className="grid gap-2">
                {chatExamples.map((example, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-card border rounded-lg">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-accent-foreground shrink-0" />
                    <div>
                      <p className="font-medium text-sm">「{example.command}」</p>
                      <p className="text-xs text-muted-foreground">{example.result}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Reference */}
        <Card className="border-2 bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg">できること一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <FileText className="h-4 w-4" />
                  請求・見積
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>• 請求書作成・送付</li>
                  <li>• 見積書作成</li>
                  <li>• 入金確認・消込</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <Calculator className="h-4 w-4" />
                  経理・会計
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>• 経費登録（領収書添付で自動）</li>
                  <li>• 仕訳作成</li>
                  <li>• 売上レポート</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <Users className="h-4 w-4" />
                  人事・労務
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>• 勤怠確認</li>
                  <li>• 休暇申請</li>
                  <li>• 給与明細</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <Target className="h-4 w-4" />
                  営業・CRM
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>• リード登録</li>
                  <li>• 商談管理</li>
                  <li>• 活動記録</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <FileText className="h-4 w-4" />
                  契約・法務
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>• 契約書作成</li>
                  <li>• 電子署名依頼</li>
                  <li>• 更新アラート</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <Clock className="h-4 w-4" />
                  その他
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>• Wiki検索・編集</li>
                  <li>• IT資産確認</li>
                  <li>• データ集計</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Complete Button */}
        <div className="flex justify-center pb-8">
          <Button size="lg" onClick={handleDismiss} className="px-8">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            チュートリアルを完了する
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}