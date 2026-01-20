import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Users, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

type Step = "company" | "invite" | "complete";

export default function Onboarding() {
  const navigate = useNavigate();
  const { createOrganization } = useOrganization();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("company");
  const [loading, setLoading] = useState(false);

  const [companyData, setCompanyData] = useState({
    name: "",
    industry: "",
    size: "",
  });

  const [invites, setInvites] = useState<string[]>([""]);

  const steps: { key: Step; title: string; icon: any }[] = [
    { key: "company", title: "会社情報", icon: Building2 },
    { key: "invite", title: "チーム招待", icon: Users },
    { key: "complete", title: "完了", icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleCompanySubmit = async () => {
    if (!companyData.name) {
      toast({
        title: "エラー",
        description: "会社名を入力してください",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await createOrganization(companyData.name);
      setStep("invite");
    } catch (error) {
      toast({
        title: "エラー",
        description: "組織の作成に失敗しました",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteSubmit = async () => {
    const validEmails = invites.filter(email => email.trim());
    const { organization } = await import("@/contexts/OrganizationContext").then(() => ({ organization: null }));

    if (validEmails.length > 0) {
      setLoading(true);
      try {
        // Get current company from context
        const { data: currentCompanyData } = await supabase
          .from('user_current_company')
          .select('company_id')
          .single();

        if (!currentCompanyData?.company_id) {
          throw new Error('会社が見つかりません');
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('ユーザーが見つかりません');

        let successCount = 0;
        for (const email of validEmails) {
          // Create invitation record
          const { data: invitation, error: invError } = await supabase
            .from('company_invitations')
            .insert({
              company_id: currentCompanyData.company_id,
              email: email.trim(),
              role: 'member',
              invited_by: user.id,
              expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            })
            .select()
            .single();

          if (invError) {
            console.error('Invitation error:', invError);
            continue;
          }

          // Send invitation email via Edge Function
          const { error: sendError } = await supabase.functions.invoke('send-invitation', {
            body: { invitationId: invitation.id }
          });

          if (!sendError) {
            successCount++;
          }
        }

        if (successCount > 0) {
          toast({
            title: "招待を送信しました",
            description: `${successCount}人にメールを送信しました`,
          });
        }
      } catch (error) {
        console.error('Invite error:', error);
        toast({
          title: "一部の招待に失敗しました",
          description: "後から設定画面で再送信できます",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    setStep("complete");
  };

  const handleComplete = () => {
    navigate("/dashboard");
  };

  const addInviteField = () => {
    setInvites([...invites, ""]);
  };

  const updateInvite = (index: number, value: string) => {
    const newInvites = [...invites];
    newInvites[index] = value;
    setInvites(newInvites);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((s, i) => (
              <div
                key={s.key}
                className={`flex items-center gap-2 text-sm ${
                  i <= currentStepIndex ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <s.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{s.title}</span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card>
          {step === "company" && (
            <>
              <CardHeader>
                <CardTitle>会社情報を入力</CardTitle>
                <CardDescription>
                  Totonosへようこそ！まず会社の基本情報を教えてください。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">会社名 *</Label>
                  <Input
                    id="company-name"
                    placeholder="株式会社〇〇"
                    value={companyData.name}
                    onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">業種</Label>
                  <Input
                    id="industry"
                    placeholder="例: IT・ソフトウェア"
                    value={companyData.industry}
                    onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size">従業員数</Label>
                  <Input
                    id="size"
                    placeholder="例: 10-50名"
                    value={companyData.size}
                    onChange={(e) => setCompanyData({ ...companyData, size: e.target.value })}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleCompanySubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="mr-2 h-4 w-4" />
                  )}
                  次へ
                </Button>
              </CardContent>
            </>
          )}

          {step === "invite" && (
            <>
              <CardHeader>
                <CardTitle>チームメンバーを招待</CardTitle>
                <CardDescription>
                  一緒に使うメンバーを招待しましょう。後からでも招待できます。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {invites.map((email, index) => (
                  <div key={index} className="space-y-2">
                    <Label htmlFor={`invite-${index}`}>
                      メールアドレス {index + 1}
                    </Label>
                    <Input
                      id={`invite-${index}`}
                      type="email"
                      placeholder="member@example.com"
                      value={email}
                      onChange={(e) => updateInvite(index, e.target.value)}
                    />
                  </div>
                ))}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={addInviteField}
                >
                  + メンバーを追加
                </Button>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep("company")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    戻る
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleInviteSubmit}
                  >
                    {invites.some(e => e.trim()) ? "招待して次へ" : "スキップ"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {step === "complete" && (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>セットアップ完了!</CardTitle>
                <CardDescription>
                  Totonosの準備が整いました。さっそく始めましょう！
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium">次のステップ</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>・ダッシュボードで概要を確認</li>
                    <li>・請求書を作成してみる</li>
                    <li>・銀行口座を連携する</li>
                    <li>・チームメンバーを追加する</li>
                  </ul>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleComplete}
                >
                  ダッシュボードへ
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
