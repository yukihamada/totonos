import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Send, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FeedbackType = "feature" | "bug" | "improvement" | "other";

const feedbackTypes: { value: FeedbackType; label: string; emoji: string }[] = [
  { value: "feature", label: "機能要望", emoji: "✨" },
  { value: "bug", label: "バグ報告", emoji: "🐛" },
  { value: "improvement", label: "改善提案", emoji: "💡" },
  { value: "other", label: "その他", emoji: "💬" },
];

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const [type, setType] = useState<FeedbackType>("feature");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "エラー",
        description: "タイトルを入力してください",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke("create-feedback", {
        body: {
          type,
          title: title.trim(),
          details: details.trim(),
          email: email.trim() || undefined,
          page: location.pathname,
        },
      });

      if (error) throw error;

      toast({
        title: "送信完了",
        description: "フィードバックをお送りいただきありがとうございます！",
      });

      // Reset form
      setType("feature");
      setTitle("");
      setDetails("");
      setEmail("");
      onOpenChange(false);
    } catch (error) {
      console.error("Feedback submission error:", error);
      toast({
        title: "送信エラー",
        description: "フィードバックの送信に失敗しました。しばらく経ってから再度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            📝 ご意見・ご要望
          </DialogTitle>
          <DialogDescription>
            製品の改善にご協力ください。いただいたフィードバックは開発チームが確認し、製品の改善に活用させていただきます。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>種類</Label>
            <RadioGroup
              value={type}
              onValueChange={(v) => setType(v as FeedbackType)}
              className="grid grid-cols-2 gap-2"
            >
              {feedbackTypes.map((ft) => (
                <div key={ft.value}>
                  <RadioGroupItem
                    value={ft.value}
                    id={ft.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={ft.value}
                    className="flex items-center gap-2 px-3 py-2 border-2 rounded-md cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted transition-colors"
                  >
                    <span>{ft.emoji}</span>
                    <span className="text-sm font-medium">{ft.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">タイトル *</Label>
            <Input
              id="title"
              placeholder="簡潔にまとめてください"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">詳細</Label>
            <Textarea
              id="details"
              placeholder="具体的な内容、再現手順、期待する動作などを記載してください"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス（任意）</Label>
            <Input
              id="email"
              type="email"
              placeholder="返信が必要な場合にご記入ください"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                送信中...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                送信する
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
