import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  FileText, 
  Users, 
  Receipt, 
  FileSignature, 
  Calculator,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface AIAgentExamplesProps {
  onChatOpen?: () => void;
}

const examples = [
  {
    icon: FileText,
    title: "請求書を作成",
    description: "株式会社ABCへ10万円の請求書を作成して",
    category: "請求",
    color: "text-chart-1"
  },
  {
    icon: Users,
    title: "リードを登録",
    description: "新規リード「山田太郎様・株式会社XYZ」を追加して",
    category: "CRM",
    color: "text-chart-2"
  },
  {
    icon: Receipt,
    title: "経費を登録",
    description: "昨日のタクシー代1,500円を経費申請して",
    category: "経費",
    color: "text-chart-3"
  },
  {
    icon: FileSignature,
    title: "契約書を作成",
    description: "月額5万円の保守契約書を作成して",
    category: "契約",
    color: "text-chart-4"
  },
  {
    icon: Calculator,
    title: "売上を確認",
    description: "今月の売上と未入金額を教えて",
    category: "会計",
    color: "text-chart-5"
  },
  {
    icon: Users,
    title: "顧客情報を検索",
    description: "株式会社ABCの連絡先と取引履歴を見せて",
    category: "CRM",
    color: "text-primary"
  }
];

export function AIAgentExamples({ onChatOpen }: AIAgentExamplesProps) {
  const handleExampleClick = (prompt: string) => {
    // Open chat and send the prompt
    window.dispatchEvent(new CustomEvent('open-chat', { detail: { prompt } }));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">AIエージェントで操作</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            <Sparkles className="h-3 w-3 mr-1" />
            チャットで実行
          </Badge>
        </div>
        <CardDescription>
          右下のチャットボタンから話しかけるだけで、以下の操作が可能です
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {examples.map((example, index) => {
            const Icon = example.icon;
            return (
              <button
                key={index}
                onClick={() => handleExampleClick(example.description)}
                className="flex flex-col gap-2 p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${example.color}`} />
                    <span className="font-medium text-sm">{example.title}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {example.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  「{example.description}」
                </p>
                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>チャットで実行</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </button>
            );
          })}
        </div>
        {onChatOpen && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-4" 
            onClick={onChatOpen}
          >
            <Bot className="mr-2 h-4 w-4" />
            AIアシスタントを開く
          </Button>
        )}
      </CardContent>
    </Card>
  );
}