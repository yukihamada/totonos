import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAcceptInvitation } from "@/hooks/useCompany";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function Invite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const { user, loading: authLoading } = useAuth();
  const acceptInvitation = useAcceptInvitation();
  const [status, setStatus] = useState<"idle" | "accepting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!authLoading && !user && token) {
      // Redirect to auth with return URL
      navigate(`/auth?redirect=/invite?token=${token}`);
      return;
    }
    
    // ログイン済みの場合は自動で受諾処理を実行
    if (!authLoading && user && token && status === 'idle') {
      handleAccept();
    }
  }, [authLoading, user, token, status]);

  const handleAccept = async () => {
    if (!token) return;
    
    setStatus("accepting");
    try {
      await acceptInvitation.mutateAsync(token);
      setStatus("success");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error: any) {
      setStatus("error");
      setErrorMessage(error.message || "招待の受諾に失敗しました");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              無効な招待
            </CardTitle>
            <CardDescription>招待トークンが見つかりません</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              ホームへ戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {status === "success" ? (
              <span className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                参加完了
              </span>
            ) : status === "error" ? (
              <span className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                エラー
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                チームに参加しています...
              </span>
            )}
          </CardTitle>
          <CardDescription>
            {status === "success"
              ? "ダッシュボードへ移動します..."
              : status === "error"
              ? errorMessage
              : "招待を処理中です。少々お待ちください..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(status === "idle" || status === "accepting") && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {status === "error" && (
            <Button onClick={() => navigate("/")} variant="outline" className="w-full">
              ホームへ戻る
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
