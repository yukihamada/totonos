import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MessageCircle, Link2, Unlink, QrCode, Copy, CheckCircle2, ExternalLink } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { QRCodeSVG } from "qrcode.react";

interface LineUser {
  id: string;
  line_user_id: string;
  display_name: string | null;
  picture_url: string | null;
  linked_at: string | null;
}

const LINE_BOT_ID = "@165ikada";
const LINE_ADD_FRIEND_URL = "https://line.me/R/ti/p/@165ikada";

export default function LineSettings() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
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
      // Use Edge Function to get status (bypasses RLS)
      const { data: response, error } = await supabase.functions.invoke("link-line", {
        body: { action: "status" }
      });

      if (error) throw error;
      setLineUser(response?.lineUser || null);
    } catch (error) {
      console.error("Failed to fetch LINE connection:", error);
      // Fallback to direct query (will work if already linked)
      try {
        const { data } = await supabase
          .from("line_users")
          .select("*")
          .eq("user_id", user?.id)
          .maybeSingle();
        setLineUser(data);
      } catch {
        // Ignore
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkAccount = async () => {
    if (!linkCode.trim()) {
      toast.error("連携コードを入力してください");
      return;
    }

    if (linkCode.trim().length < 6) {
      toast.error("連携コードは6文字以上入力してください");
      return;
    }

    setIsLinking(true);
    try {
      // Use Edge Function to link (bypasses RLS for unlinked users)
      const { data: response, error } = await supabase.functions.invoke("link-line", {
        body: { action: "link", linkCode: linkCode.trim() }
      });

      if (error) {
        toast.error("連携処理でエラーが発生しました");
        console.error("Link error:", error);
        return;
      }

      if (response?.error) {
        toast.error(response.error);
        return;
      }

      toast.success(response?.message || "LINE連携が完了しました！");
      setLineUser(response?.lineUser || null);
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
      // Use Edge Function to unlink
      const { data: response, error } = await supabase.functions.invoke("link-line", {
        body: { action: "unlink" }
      });

      if (error) throw error;

      if (response?.error) {
        toast.error(response.error);
        return;
      }

      toast.success(response?.message || "LINE連携を解除しました");
      setLineUser(null);
    } catch (error) {
      console.error("Failed to unlink LINE account:", error);
      toast.error("連携解除に失敗しました");
    }
  };

  const copyBotId = () => {
    navigator.clipboard.writeText(LINE_BOT_ID);
    toast.success("LINE Bot IDをコピーしました");
  };

  const openLineAddFriend = () => {
    window.open(LINE_ADD_FRIEND_URL, "_blank");
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
                        {isMobile 
                          ? "下のボタンをタップして友だち追加してください" 
                          : "以下のBot IDを検索して友だち追加してください"}
                      </p>
                      {isMobile ? (
                        <Button 
                          onClick={openLineAddFriend}
                          className="bg-[#00B900] hover:bg-[#00A000] text-white"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          LINEで友だち追加
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <code className="px-3 py-1 bg-muted rounded text-sm">
                            {LINE_BOT_ID}
                          </code>
                          <Button variant="ghost" size="sm" onClick={copyBotId}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
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

            {/* モバイルではリンクボタン、PCではQRコード */}
            {isMobile ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-[#00B900]" />
                    友だち追加
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    下のボタンをタップしてLINE公式アカウントを友だち追加してください。
                  </p>
                  <Button 
                    onClick={openLineAddFriend}
                    className="w-full bg-[#00B900] hover:bg-[#00A000] text-white"
                    size="lg"
                  >
                    <ExternalLink className="mr-2 h-5 w-5" />
                    LINEで友だち追加
                  </Button>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <span className="text-sm text-muted-foreground">Bot ID:</span>
                    <code className="px-2 py-1 bg-muted rounded text-sm">{LINE_BOT_ID}</code>
                    <Button variant="ghost" size="sm" onClick={copyBotId}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    QRコードで友だち追加
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <QRCodeSVG 
                      value={LINE_ADD_FRIEND_URL}
                      size={192}
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    スマートフォンでQRコードを読み取って友だち追加
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <span className="text-sm text-muted-foreground">Bot ID:</span>
                    <code className="px-2 py-1 bg-muted rounded text-sm">{LINE_BOT_ID}</code>
                    <Button variant="ghost" size="sm" onClick={copyBotId}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}