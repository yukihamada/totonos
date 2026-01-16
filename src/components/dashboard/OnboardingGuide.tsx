import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  MessageCircle, 
  Mail, 
  Settings, 
  ArrowRight, 
  Sparkles, 
  X, 
  Check,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Link } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface OnboardingGuideProps {
  onChatOpen?: () => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: typeof Bot;
  color: string;
  actionLabel: string;
  actionLink?: string;
  onAction?: () => void;
  checkKey: string;
}

const ONBOARDING_STORAGE_KEY = "onboarding-completed-steps";
const ONBOARDING_DISMISSED_KEY = "onboarding-guide-dismissed";

export function OnboardingGuide({ onChatOpen }: OnboardingGuideProps) {
  const [dismissed, setDismissed] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const isDismissed = localStorage.getItem(ONBOARDING_DISMISSED_KEY);
    if (isDismissed === "true") {
      setDismissed(true);
    }

    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (completed) {
      try {
        setCompletedSteps(JSON.parse(completed));
      } catch {
        setCompletedSteps([]);
      }
    }
  }, []);

  const steps: OnboardingStep[] = [
    {
      id: "chat",
      title: "AIアシスタントを試す",
      description: "右下のチャットボタンからAIに話しかけてみましょう",
      icon: Bot,
      color: "text-primary",
      actionLabel: "チャットを開く",
      onAction: () => {
        markStepComplete("chat");
        onChatOpen?.();
      },
      checkKey: "chat"
    },
    {
      id: "email",
      title: "メールでAIを使う",
      description: "minato@totonos.jp にメールを送るだけで自動処理",
      icon: Mail,
      color: "text-chart-2",
      actionLabel: "メール設定",
      actionLink: "/email-integration",
      checkKey: "email"
    },
    {
      id: "line",
      title: "LINE連携を設定",
      description: "LINEからも全機能にアクセス可能に",
      icon: MessageCircle,
      color: "text-[#00B900]",
      actionLabel: "LINE設定",
      actionLink: "/line-settings",
      checkKey: "line"
    }
  ];

  const markStepComplete = (stepId: string) => {
    const newCompleted = [...completedSteps, stepId];
    setCompletedSteps(newCompleted);
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(newCompleted));
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(ONBOARDING_DISMISSED_KEY, "true");
  };

  const handleStepAction = (step: OnboardingStep) => {
    markStepComplete(step.id);
    if (step.onAction) {
      step.onAction();
    }
  };

  const progress = (completedSteps.length / steps.length) * 100;
  const allComplete = completedSteps.length >= steps.length;

  // 全て完了していたら表示しない
  if (dismissed || allComplete) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-chart-2/5">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">セットアップガイド</CardTitle>
                <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                  {completedSteps.length}/{steps.length}
                </Badge>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </CollapsibleTrigger>
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
            AIアシスタントの3つの使い方を試してみましょう
          </CardDescription>
          <Progress value={progress} className="h-2 mt-2" />
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-3 pt-2">
            {steps.map((step) => {
              const Icon = step.icon;
              const isComplete = completedSteps.includes(step.id);

              return (
                <div
                  key={step.id}
                  className={`p-4 bg-background border rounded-lg transition-all ${
                    isComplete ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${isComplete ? "bg-muted" : "bg-primary/10"}`}>
                        {isComplete ? (
                          <Check className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Icon className={`h-5 w-5 ${step.color}`} />
                        )}
                      </div>
                      <div>
                        <h3 className={`font-medium ${isComplete ? "line-through text-muted-foreground" : ""}`}>
                          {step.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    {!isComplete && (
                      step.actionLink ? (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          onClick={() => handleStepAction(step)}
                        >
                          <Link to={step.actionLink}>
                            {step.actionLabel}
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStepAction(step)}
                        >
                          {step.actionLabel}
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      )
                    )}
                  </div>
                </div>
              );
            })}

            {/* Quick Links */}
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <Button variant="ghost" size="sm" asChild className="text-xs">
                <Link to="/ai-settings">
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
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
