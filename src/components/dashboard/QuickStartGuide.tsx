import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Bot, MessageSquare, Settings, ArrowRight, Sparkles, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

interface QuickStartGuideProps {
  onChatOpen?: () => void;
}

export function QuickStartGuide({ onChatOpen }: QuickStartGuideProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem("quickstart-guide-dismissed");
    if (isDismissed === "true") {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("quickstart-guide-dismissed", "true");
  };

  if (dismissed) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-chart-2/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">はじめての方へ</CardTitle>
            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">ガイド</Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          AIアシスタントとLINE連携で業務を効率化しましょう
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Assistant Guide */}
        <div className="p-4 bg-background border rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h3 className="font-medium">AIアシスタント</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            画面右下の<span className="inline-flex items-center mx-1 px-1.5 py-0.5 bg-primary/10 rounded text-primary text-xs font-medium">
              <MessageSquare className="h-3 w-3 mr-1" />チャット
            </span>ボタンからAIに話しかけられます。
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 pl-4">
            <li>• 「今月の請求書を確認して」</li>
            <li>• 「新しいリードを登録して」</li>
            <li>• 「売上レポートを見せて」</li>
          </ul>
          {onChatOpen && (
            <Button variant="outline" size="sm" className="w-full" onClick={onChatOpen}>
              <MessageSquare className="mr-2 h-4 w-4" />
              AIアシスタントを開く
            </Button>
          )}
        </div>

        {/* LINE Integration Guide */}
        <div className="p-4 bg-background border rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-[#00B900]" />
            <h3 className="font-medium">LINE連携</h3>
            <Badge variant="secondary" className="bg-[#00B900]/10 text-[#00B900] text-xs">NEW</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            LINEからも全機能にアクセスできます。外出先でも請求書確認、契約書送付などが可能です。
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link to="/settings/line">
                <Settings className="mr-2 h-4 w-4" />
                LINE連携設定
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link to="/settings/ai">
              AI設定
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link to="/settings">
              一般設定
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link to="/credits">
              クレジット確認
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
