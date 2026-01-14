import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/types/database";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Shield, FileSignature, CheckCircle, AlertCircle, Loader2, Building, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { Contract, ContractItem } from "@/types/contract";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type SignStep = "loading" | "verify" | "review" | "signing" | "success" | "error" | "already_signed";

export default function ContractSign() {
  const { token } = useParams<{ token: string }>();
  const [step, setStep] = useState<SignStep>("loading");
  const [contract, setContract] = useState<Contract | null>(null);
  const [items, setItems] = useState<ContractItem[]>([]);
  const [signatorName, setSignatorName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  const [signedAt, setSignedAt] = useState<string | null>(null);

  useEffect(() => {
    loadContract();
  }, [token]);

  const loadContract = async () => {
    try {
      // Find signature record by token
      const { data: signature, error: sigError } = await supabase
        .from("contract_signatures")
        .select("*, contract:contracts(*)")
        .eq("signature_token", token)
        .single();

      if (sigError || !signature) {
        setError("署名リンクが無効または期限切れです");
        setStep("error");
        return;
      }

      if (signature.signed_at) {
        setStep("already_signed");
        return;
      }

      // Load contract with client
      const { data: contractData, error: contractError } = await supabase
        .from("contracts")
        .select("*, client:clients(id, name, email)")
        .eq("id", signature.contract_id)
        .single();

      if (contractError || !contractData) {
        setError("契約書が見つかりません");
        setStep("error");
        return;
      }

      // Load contract items
      const { data: itemsData } = await supabase
        .from("contract_items")
        .select("*")
        .eq("contract_id", signature.contract_id)
        .order("item_order", { ascending: true });

      setContract(contractData as Contract);
      setItems(itemsData || []);
      
      // Request OTP when loading the contract
      await sendOtpCode();
      
      setStep("verify");
    } catch (err) {
      console.error("Failed to load contract:", err);
      setError("エラーが発生しました");
      setStep("error");
    }
  };

  const sendOtpCode = async () => {
    if (!token) return;
    
    setIsSendingOtp(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { token },
      });

      if (error) {
        console.error("Failed to send OTP:", error);
        toast.error("確認コードの送信に失敗しました");
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.email) {
        setMaskedEmail(data.email);
      }
      
      toast.success("確認コードをメールで送信しました");
    } catch (err) {
      console.error("Failed to send OTP:", err);
      toast.error("確認コードの送信に失敗しました");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      toast.error("6桁のコードを入力してください");
      return;
    }

    setIsVerifying(true);
    setStep("review");
    setIsVerifying(false);
  };

  const handleSign = async () => {
    if (!signatorName.trim()) {
      toast.error("署名者名を入力してください");
      return;
    }

    if (signatorName.trim().length > 100) {
      toast.error("署名者名は100文字以内で入力してください");
      return;
    }

    setIsSigning(true);
    setStep("signing");

    try {
      // Call the secure edge function to sign the contract
      const { data, error } = await supabase.functions.invoke("sign-contract", {
        body: {
          token,
          otpCode,
          signatorName: signatorName.trim(),
        },
      });

      if (error) {
        console.error("Signing error:", error);
        throw new Error("署名処理に失敗しました");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setSignedAt(data?.signedAt || new Date().toISOString());
      setStep("success");
    } catch (err) {
      console.error("Failed to sign contract:", err);
      setError(err instanceof Error ? err.message : "署名処理に失敗しました");
      setStep("error");
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-8 w-8 items-center justify-center border-2 border-foreground bg-foreground text-background font-bold">
            T
          </div>
          <span className="text-xl font-bold tracking-tight">Totonos</span>
        </div>

        {step === "loading" && (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">読み込み中...</p>
            </CardContent>
          </Card>
        )}

        {step === "error" && (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
              <h2 className="text-xl font-bold mt-4">エラーが発生しました</h2>
              <p className="text-muted-foreground mt-2">{error}</p>
            </CardContent>
          </Card>
        )}

        {step === "already_signed" && (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-chart-2" />
              <h2 className="text-xl font-bold mt-4">署名済みです</h2>
              <p className="text-muted-foreground mt-2">
                この契約書はすでに署名されています。
              </p>
            </CardContent>
          </Card>
        )}

        {step === "verify" && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Shield className="h-6 w-6" />
                本人確認
              </CardTitle>
              <CardDescription>
                {maskedEmail ? (
                  <>
                    <span className="font-medium">{maskedEmail}</span> 宛に送信された6桁の確認コードを入力してください
                  </>
                ) : (
                  "メールで送信された6桁の確認コードを入力してください"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otpCode}
                  onChange={(value) => setOtpCode(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              
              <div className="text-center">
                <Button
                  variant="link"
                  size="sm"
                  onClick={sendOtpCode}
                  disabled={isSendingOtp}
                  className="text-muted-foreground"
                >
                  {isSendingOtp ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      送信中...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      確認コードを再送信
                    </>
                  )}
                </Button>
              </div>

              <Button
                className="w-full"
                onClick={handleVerifyOTP}
                disabled={isVerifying || otpCode.length !== 6}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    確認中...
                  </>
                ) : (
                  "確認して契約書を表示"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "review" && contract && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{contract.title}</CardTitle>
                    <CardDescription className="font-mono">
                      {contract.contract_number}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">署名待ち</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">発行者:</span>
                  <span className="font-medium">{contract.client?.name || "-"}</span>
                </div>

                <Separator />

                <div>
                  <span className="text-sm text-muted-foreground">契約金額</span>
                  <p className="text-2xl font-bold">{formatCurrency(contract.total_amount)}</p>
                </div>

                {contract.content && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">契約概要</h4>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {contract.content}
                      </p>
                    </div>
                  </>
                )}

                {items.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h4 className="font-medium">契約条項</h4>
                      {items.map((item, index) => (
                        <div key={item.id} className="p-4 border rounded-lg">
                          <h5 className="font-medium">
                            第{index + 1}条 {item.title}
                          </h5>
                          <p className="mt-2 text-muted-foreground whitespace-pre-wrap">
                            {item.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <Separator />

                <div className="space-y-4">
                  <Label htmlFor="signatorName">署名者名（あなたの氏名）</Label>
                  <Input
                    id="signatorName"
                    placeholder="山田 太郎"
                    value={signatorName}
                    onChange={(e) => setSignatorName(e.target.value)}
                    maxLength={100}
                  />
                </div>

                <div className="p-4 border border-chart-1 rounded-lg bg-chart-1/10">
                  <p className="text-sm">
                    「署名して締結」をクリックすると、この契約書に法的拘束力のある電子署名を行います。
                    署名後は内容の変更はできません。
                  </p>
                </div>

                <Button className="w-full" onClick={handleSign} disabled={!signatorName.trim() || isSigning}>
                  <FileSignature className="h-4 w-4 mr-2" />
                  署名して締結
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "signing" && (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <h2 className="text-xl font-bold mt-4">署名処理中...</h2>
              <p className="text-muted-foreground mt-2">
                電子署名を記録しています
              </p>
            </CardContent>
          </Card>
        )}

        {step === "success" && (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-chart-2" />
              <h2 className="text-xl font-bold mt-4">署名が完了しました</h2>
              <p className="text-muted-foreground mt-2">
                契約書への署名が正常に記録されました。
                <br />
                確認メールをお送りしました。
              </p>
              <div className="mt-6 p-4 border rounded-lg text-left">
                <div className="flex items-center gap-2 text-chart-2">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">署名証明</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  署名日時: {signedAt ? format(new Date(signedAt), "yyyy年MM月dd日 HH:mm:ss", { locale: ja }) : format(new Date(), "yyyy年MM月dd日 HH:mm:ss", { locale: ja })}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
