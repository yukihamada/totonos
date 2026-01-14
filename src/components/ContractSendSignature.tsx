import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Send, Mail, Link, Shield, Clock, Info, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Contract } from "@/types/contract";

interface ContractSendSignatureProps {
  contract: Contract;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSent?: () => void;
}

type SendMethod = "email" | "link";

export function ContractSendSignature({
  contract,
  open,
  onOpenChange,
  onSent,
}: ContractSendSignatureProps) {
  const [sendMethod, setSendMethod] = useState<SendMethod>("email");
  const [recipientEmail, setRecipientEmail] = useState(contract.client?.email || "");
  const [recipientName, setRecipientName] = useState(contract.client?.name || "");
  const [message, setMessage] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const handleSend = async () => {
    if (!agreeTerms) {
      toast.error("電子署名に関する同意が必要です");
      return;
    }

    if (sendMethod === "email" && !recipientEmail) {
      toast.error("メールアドレスを入力してください");
      return;
    }

    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-contract-signature", {
        body: {
          contractId: contract.id,
          sendMethod,
          recipientEmail: recipientEmail || null,
          recipientName: recipientName || null,
          message: message || null,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (sendMethod === "link" && data?.signatureUrl) {
        setGeneratedLink(data.signatureUrl);
        toast.success("署名リンクを生成しました");
      } else {
        toast.success("署名依頼を送信しました");
        onOpenChange(false);
        onSent?.();
      }
    } catch (error) {
      console.error("Failed to send signature request:", error);
      toast.error("署名依頼の送信に失敗しました");
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      toast.success("リンクをコピーしました");
    }
  };

  const handleClose = () => {
    setGeneratedLink(null);
    setAgreeTerms(false);
    setMessage("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            電子署名を依頼
          </DialogTitle>
          <DialogDescription>
            {contract.title}（{contract.contract_number}）
          </DialogDescription>
        </DialogHeader>

        {generatedLink ? (
          <div className="space-y-4 py-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>署名リンクを生成しました</AlertTitle>
              <AlertDescription>
                以下のリンクを取引先に共有してください
              </AlertDescription>
            </Alert>

            <div className="p-3 bg-muted rounded-lg break-all text-sm font-mono">
              {generatedLink}
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleCopyLink}>
                リンクをコピー
              </Button>
              <Button variant="outline" onClick={handleClose}>
                閉じる
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              {/* 法的説明 */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>電子署名法に準拠</AlertTitle>
                <AlertDescription className="text-xs">
                  この電子署名は、電子署名及び認証業務に関する法律（電子署名法）に準拠しています。
                  OTP認証による本人確認、タイムスタンプ、IPアドレス記録により法的効力を担保します。
                </AlertDescription>
              </Alert>

              {/* 送信方法 */}
              <div className="space-y-2">
                <Label>送信方法</Label>
                <Select value={sendMethod} onValueChange={(v) => setSendMethod(v as SendMethod)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        メールで送信
                      </div>
                    </SelectItem>
                    <SelectItem value="link">
                      <div className="flex items-center gap-2">
                        <Link className="h-4 w-4" />
                        リンクを生成
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 宛先情報 */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>宛先名</Label>
                  <Input
                    placeholder="株式会社〇〇 担当者様"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                  />
                </div>
                {sendMethod === "email" && (
                  <div className="space-y-2">
                    <Label>メールアドレス *</Label>
                    <Input
                      type="email"
                      placeholder="contact@example.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* メッセージ */}
              <div className="space-y-2">
                <Label>メッセージ（任意）</Label>
                <Textarea
                  placeholder="署名依頼に添えるメッセージを入力..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <Separator />

              {/* 署名プロセス説明 */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  署名プロセス
                </Label>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">1</Badge>
                    <div>
                      <p className="font-medium">メールでOTP送信</p>
                      <p className="text-muted-foreground text-xs">
                        署名者のメールアドレスに6桁の確認コードを送信
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">2</Badge>
                    <div>
                      <p className="font-medium">本人確認</p>
                      <p className="text-muted-foreground text-xs">
                        OTPコード入力により本人確認を実施
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">3</Badge>
                    <div>
                      <p className="font-medium">契約内容確認・署名</p>
                      <p className="text-muted-foreground text-xs">
                        契約内容を確認後、電子署名を実行
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">4</Badge>
                    <div>
                      <p className="font-medium">タイムスタンプ記録</p>
                      <p className="text-muted-foreground text-xs">
                        署名日時・IPアドレス・ユーザーエージェントを記録
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 同意チェック */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="agree-terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                />
                <label htmlFor="agree-terms" className="text-sm leading-relaxed">
                  電子署名法に基づく電子署名として本契約書を送信することに同意します。
                  署名完了後は契約内容の変更ができないことを理解しています。
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                キャンセル
              </Button>
              <Button onClick={handleSend} disabled={!agreeTerms || isSending}>
                {isSending ? (
                  "送信中..."
                ) : sendMethod === "email" ? (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    メールで送信
                  </>
                ) : (
                  <>
                    <Link className="h-4 w-4 mr-2" />
                    リンクを生成
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
