import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Users, CreditCard, Shield, Loader2, Plus, Trash2, Mail } from "lucide-react";

export default function OrganizationSettings() {
  const { organization, membership, updateOrganization } = useOrganization();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "manager" | "member" | "viewer">("member");

  const [formData, setFormData] = useState({
    name: organization?.name || "",
    display_name: organization?.display_name || "",
  });

  const handleSave = async () => {
    if (!organization) return;

    setSaving(true);
    try {
      await updateOrganization({
        name: formData.name,
        display_name: formData.display_name,
      });
      toast({
        title: "保存しました",
        description: "組織情報を更新しました",
      });
    } catch (error) {
      toast({
        title: "エラー",
        description: "保存に失敗しました",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail || !organization) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ユーザーが見つかりません');

      // Map frontend role to DB role
      const dbRole = inviteRole === 'admin' ? 'admin' : inviteRole === 'manager' ? 'admin' : 'member';

      // Create invitation record
      const { data: invitation, error: invError } = await supabase
        .from('company_invitations')
        .insert({
          company_id: organization.id,
          email: inviteEmail.trim(),
          role: dbRole,
          invited_by: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (invError) throw invError;

      // Send invitation email via Edge Function
      const { error: sendError } = await supabase.functions.invoke('send-invitation', {
        body: { invitationId: invitation.id }
      });

      if (sendError) {
        console.error('Send invitation error:', sendError);
        toast({
          title: "招待を作成しました",
          description: "メール送信に問題がありましたが、招待は作成されました",
        });
      } else {
        toast({
          title: "招待を送信しました",
          description: `${inviteEmail} に招待メールを送信しました`,
        });
      }
      setInviteEmail("");
    } catch (error: any) {
      console.error('Invite error:', error);
      toast({
        title: "エラー",
        description: error.message?.includes('duplicate') 
          ? "このメールアドレスは既に招待済みです" 
          : "招待の送信に失敗しました",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const isAdmin = membership?.role === "owner" || membership?.role === "admin";

  const planBadgeColor = {
    free: "secondary",
    pro: "default",
    enterprise: "destructive",
  } as const;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">組織設定</h1>
          <p className="text-muted-foreground">
            組織の基本情報、メンバー、プランを管理します
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general" className="gap-2">
              <Building2 className="h-4 w-4" />
              基本情報
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <Users className="h-4 w-4" />
              メンバー
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2">
              <CreditCard className="h-4 w-4" />
              プラン・課金
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              セキュリティ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>基本情報</CardTitle>
                <CardDescription>
                  組織の名前やURLスラッグを設定します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">組織名</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isAdmin}
                  />
                </div>

                <div>
                  <Label htmlFor="display_name">表示名</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    disabled={!isAdmin}
                    placeholder="例: サンプル社"
                  />
                </div>
                <div className="flex items-center gap-4 pt-4">
                  <div>
                    <Label>現在のプラン</Label>
                    <div className="mt-1">
                      <Badge variant={planBadgeColor[organization?.plan || "free"]}>
                        {organization?.plan?.toUpperCase() || "FREE"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <Button onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    保存
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>メンバー管理</CardTitle>
                <CardDescription>
                  組織のメンバーを招待・管理します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isAdmin && (
                  <div className="flex gap-4 p-4 border rounded-lg bg-muted/50">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="invite-email">メールアドレス</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        placeholder="member@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div className="w-40 space-y-2">
                      <Label>権限</Label>
                      <Select value={inviteRole} onValueChange={(v: any) => setInviteRole(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">管理者</SelectItem>
                          <SelectItem value="manager">マネージャー</SelectItem>
                          <SelectItem value="member">メンバー</SelectItem>
                          <SelectItem value="viewer">閲覧者</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleInvite}>
                        <Mail className="mr-2 h-4 w-4" />
                        招待
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="font-medium">メンバー一覧</h3>
                  <div className="border rounded-lg divide-y">
                    {/* Placeholder members */}
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">オーナー</p>
                          <p className="text-sm text-muted-foreground">owner@example.com</p>
                        </div>
                      </div>
                      <Badge>オーナー</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>プラン・課金</CardTitle>
                <CardDescription>
                  サブスクリプションプランと支払い情報を管理します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className={organization?.plan === "free" ? "border-primary" : ""}>
                    <CardHeader>
                      <CardTitle className="text-lg">Free</CardTitle>
                      <CardDescription>小規模チーム向け</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">¥0</p>
                      <p className="text-sm text-muted-foreground">/月</p>
                      <ul className="mt-4 space-y-2 text-sm">
                        <li>ユーザー3名まで</li>
                        <li>基本機能</li>
                        <li>1GB ストレージ</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className={organization?.plan === "pro" ? "border-primary" : ""}>
                    <CardHeader>
                      <CardTitle className="text-lg">Pro</CardTitle>
                      <CardDescription>成長企業向け</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">¥2,980</p>
                      <p className="text-sm text-muted-foreground">/月/ユーザー</p>
                      <ul className="mt-4 space-y-2 text-sm">
                        <li>無制限ユーザー</li>
                        <li>全機能利用可能</li>
                        <li>100GB ストレージ</li>
                        <li>優先サポート</li>
                      </ul>
                      {organization?.plan !== "pro" && (
                        <Button className="w-full mt-4">アップグレード</Button>
                      )}
                    </CardContent>
                  </Card>

                  <Card className={organization?.plan === "enterprise" ? "border-primary" : ""}>
                    <CardHeader>
                      <CardTitle className="text-lg">Enterprise</CardTitle>
                      <CardDescription>大企業向け</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">お問合せ</p>
                      <p className="text-sm text-muted-foreground">カスタム</p>
                      <ul className="mt-4 space-y-2 text-sm">
                        <li>SSO/SAML対応</li>
                        <li>専用サポート</li>
                        <li>SLA保証</li>
                        <li>オンプレミス対応</li>
                      </ul>
                      <Button variant="outline" className="w-full mt-4">お問合せ</Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>セキュリティ設定</CardTitle>
                <CardDescription>
                  組織のセキュリティポリシーを設定します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">二要素認証（2FA）</p>
                    <p className="text-sm text-muted-foreground">
                      全メンバーに二要素認証を必須にする
                    </p>
                  </div>
                  <Badge variant="secondary">Enterprise</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">SSO/SAML</p>
                    <p className="text-sm text-muted-foreground">
                      シングルサインオンを設定する
                    </p>
                  </div>
                  <Badge variant="secondary">Enterprise</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">IPアドレス制限</p>
                    <p className="text-sm text-muted-foreground">
                      許可されたIPアドレスからのみアクセス可能にする
                    </p>
                  </div>
                  <Badge variant="secondary">Enterprise</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
