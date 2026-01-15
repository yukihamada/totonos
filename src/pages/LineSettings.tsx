import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MessageCircle, Link2, Unlink, QrCode, Copy, CheckCircle2 } from "lucide-react";

interface LineUser {
  id: string;
  line_user_id: string;
  display_name: string | null;
  picture_url: string | null;
  linked_at: string | null;
}

export default function LineSettings() {
  const { user } = useAuth();
  const [lineUser, setLineUser] = useState<LineUser | null>(null);
  const [linkCode, setLinkCode] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLineConnection();
    }
  }, [user]);

  const fetchLineConnection = async () => {
    try {
      const { data, error } = await supabase
        .from("line_users")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }
      setLineUser(data);
    } catch (error) {
      console.error("Failed to fetch LINE connection:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkAccount = async () => {
    if (!linkCode.trim()) {
      toast.error("連携コードを入力してください");
      return;
    }

    setIsLinking(true);
    try {
      // Find LINE user by code prefix
      const { data: lineUsers, error: searchError } = await supabase
        .from("line_users")
        .select("*")
        .is("user_id", null)
        .ilike("line_user_id", `${linkCode}%`);

      if (searchError) throw searchError;

      if (!lineUsers || lineUsers.length === 0) {
        toast.error("連携コードが見つかりません。LINEで「連携」と送信して新しいコードを取得してください。");
        return;
      }

      const targetLineUser = lineUsers[0];

      // Link the accounts
      const { error: updateError } = await supabase
        .from("line_users")
        .update({
          user_id: user?.id,
          linked_at: new Date().toISOString(),
        })
        .eq("id", targetLineUser.id);

      if (updateError) throw updateError;

      toast.success("LINE連携が完了しました！");
      fetchLineConnection();
      setLinkCode("");
    } catch (error) {
      console.error("Failed to link LINE account:", error);
      toast.error("連携に失敗しました");
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkAccount = async () => {
    if (!lineUser) return;

    try {
      const { error } = await supabase
        .from("line_users")
        .update({
          user_id: null,
          linked_at: null,
        })
        .eq("id", lineUser.id);

      if (error) throw error;

      toast.success("LINE連携を解除しました");
      setLineUser(null);
    } catch (error) {
      console.error("Failed to unlink LINE account:", error);
      toast.error("連携解除に失敗しました");
    }
  };

  const copyBotId = () => {
    navigator.clipboard.writeText("@totonos");
    toast.success("LINE Bot IDをコピーしました");
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle className="h-8 w-8 text-[#00B900]" />
          <h1 className="text-2xl font-bold">LINE連携設定</h1>
        </div>

        {lineUser ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {lineUser.picture_url ? (
                    <img
                      src={lineUser.picture_url}
                      alt={lineUser.display_name || "LINE User"}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#00B900] flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">
                      {lineUser.display_name || "LINE ユーザー"}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      連携済み
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-[#00B900]/10 text-[#00B900]">
                  アクティブ
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">利用可能な機能</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• LINEからAIアシスタントに質問・指示</li>
                  <li>• 請求書・見積書の作成と検索</li>
                  <li>• リード・案件の管理</li>
                  <li>• 従業員・勤怠の確認</li>
                  <li>• 仕訳・経費の登録</li>
                  <li>• プロジェクト・タスクの管理</li>
                </ul>
              </div>

              {lineUser.linked_at && (
                <p className="text-sm text-muted-foreground">
                  連携日時: {new Date(lineUser.linked_at).toLocaleString("ja-JP")}
                </p>
              )}

              <Button
                variant="outline"
                className="w-full text-destructive hover:text-destructive"
                onClick={handleUnlinkAccount}
              >
                <Unlink className="mr-2 h-4 w-4" />
                連携を解除
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>LINE連携の手順</CardTitle>
                <CardDescription>
                  LINEからTotonosの全機能を利用できるようになります
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <div>
                      <h3 className="font-medium">LINE Botを友だち追加</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        以下のBot IDを検索して友だち追加してください
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="px-3 py-1 bg-muted rounded text-sm">
                          @totonos
                        </code>
                        <Button variant="ghost" size="sm" onClick={copyBotId}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <div>
                      <h3 className="font-medium">連携コードを取得</h3>
                      <p className="text-sm text-muted-foreground">
                        LINEで何かメッセージを送ると、連携コードが表示されます
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <div>
                      <h3 className="font-medium">連携コードを入力</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        LINEで表示された連携コードを入力してください
                      </p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="例: U1234abc"
                          value={linkCode}
                          onChange={(e) => setLinkCode(e.target.value)}
                          className="max-w-xs"
                        />
                        <Button onClick={handleLinkAccount} disabled={isLinking}>
                          <Link2 className="mr-2 h-4 w-4" />
                          {isLinking ? "連携中..." : "連携する"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  QRコードで友だち追加
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  {/* LINE Official Account QR Code */}
                  <div className="w-48 h-48 flex items-center justify-center">
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      {/* Simple QR code placeholder - replace with actual QR code image */}
                      <rect x="0" y="0" width="200" height="200" fill="white"/>
                      <rect x="10" y="10" width="50" height="50" fill="black"/>
                      <rect x="20" y="20" width="30" height="30" fill="white"/>
                      <rect x="25" y="25" width="20" height="20" fill="black"/>
                      <rect x="140" y="10" width="50" height="50" fill="black"/>
                      <rect x="150" y="20" width="30" height="30" fill="white"/>
                      <rect x="155" y="25" width="20" height="20" fill="black"/>
                      <rect x="10" y="140" width="50" height="50" fill="black"/>
                      <rect x="20" y="150" width="30" height="30" fill="white"/>
                      <rect x="25" y="155" width="20" height="20" fill="black"/>
                      {/* Center pattern */}
                      <rect x="70" y="70" width="60" height="60" fill="black"/>
                      <rect x="80" y="80" width="40" height="40" fill="white"/>
                      <rect x="90" y="90" width="20" height="20" fill="black"/>
                      {/* Random data pattern */}
                      <rect x="70" y="10" width="10" height="10" fill="black"/>
                      <rect x="90" y="10" width="10" height="10" fill="black"/>
                      <rect x="110" y="10" width="10" height="10" fill="black"/>
                      <rect x="70" y="30" width="10" height="10" fill="black"/>
                      <rect x="100" y="30" width="10" height="10" fill="black"/>
                      <rect x="120" y="30" width="10" height="10" fill="black"/>
                      <rect x="80" y="50" width="10" height="10" fill="black"/>
                      <rect x="110" y="50" width="10" height="10" fill="black"/>
                    </svg>
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  スマートフォンでQRコードを読み取って友だち追加
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}