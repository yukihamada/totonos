import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  KeySquare,
  ArrowLeft,
  RefreshCw,
  Wifi,
  WifiOff,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  FileSignature,
  Copy,
  Loader2,
  Info,
} from "lucide-react";
import { useHpkiBridge } from "@/hooks/emr/useHpkiBridge";
import { HpkiBridgeDownload } from "@/components/emr/HpkiBridgeDownload";
import { useToast } from "@/hooks/use-toast";

export default function EmrHpkiBridge() {
  const { status, readers, loading, error, refreshStatus, sign } = useHpkiBridge();
  const { toast } = useToast();

  const [textData, setTextData] = useState("");
  const [pin, setPin] = useState("");
  const [signatureResult, setSignatureResult] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);

  const handleSign = async () => {
    if (!textData.trim()) {
      toast({
        title: "エラー",
        description: "署名対象のテキストを入力してください",
        variant: "destructive",
      });
      return;
    }

    if (!pin) {
      toast({
        title: "エラー",
        description: "PINを入力してください",
        variant: "destructive",
      });
      return;
    }

    setSigning(true);
    setSignatureResult(null);

    const result = await sign({ text_data: textData, pin });

    if (result.signature_hex) {
      setSignatureResult(result.signature_hex);
      toast({
        title: "署名成功",
        description: "電子署名が完了しました",
      });
    } else {
      toast({
        title: "署名失敗",
        description: result.error || "署名中にエラーが発生しました",
        variant: "destructive",
      });
    }

    setSigning(false);
    setPin(""); // Clear PIN for security
  };

  const copySignature = () => {
    if (signatureResult) {
      navigator.clipboard.writeText(signatureResult);
      toast({
        title: "コピーしました",
        description: "署名データをクリップボードにコピーしました",
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/emr">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <KeySquare className="h-6 w-6" />
                HPKI署名テスト
              </h1>
              <p className="text-muted-foreground">
                電子署名の接続確認とテスト
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={refreshStatus} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            ステータス更新
          </Button>
        </div>

        {/* Bridge App Download */}
        <HpkiBridgeDownload />

        {/* Setup Instructions */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>ブリッジアプリのセットアップ</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>上記からHPKIブリッジアプリをダウンロードしてインストールしてください。</p>
            <p className="text-sm text-muted-foreground">
              または、開発者の方はソースコードから起動することも可能です:
            </p>
            <div className="bg-muted p-3 rounded-md font-mono text-sm">
              <p>cd hpki-bridge</p>
              <p>pip install -r requirements.txt</p>
              <p>uvicorn bridge_server:app --host 0.0.0.0 --port 8000</p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>接続ステータス</CardTitle>
              <CardDescription>
                HPKIブリッジサーバーとICカードの状態
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Server Status */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {status.connected ? (
                    <Wifi className="h-5 w-5 text-green-500" />
                  ) : (
                    <WifiOff className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">ブリッジサーバー</p>
                    <p className="text-sm text-muted-foreground">
                      localhost:8000
                    </p>
                  </div>
                </div>
                <Badge
                  variant={status.connected ? "default" : "destructive"}
                  className={status.connected ? "bg-green-500" : ""}
                >
                  {status.connected ? "接続中" : "未接続"}
                </Badge>
              </div>

              {/* Card Reader Status */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard
                    className={`h-5 w-5 ${
                      status.cardInserted ? "text-green-500" : "text-muted-foreground"
                    }`}
                  />
                  <div>
                    <p className="font-medium">ICカードリーダー</p>
                    <p className="text-sm text-muted-foreground">
                      {status.readerName || "検出されていません"}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={status.cardInserted ? "default" : "secondary"}
                  className={status.cardInserted ? "bg-green-500" : ""}
                >
                  {status.cardInserted ? "カード挿入済" : "カード未挿入"}
                </Badge>
              </div>

              {/* Reader List */}
              {readers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">検出されたリーダー:</p>
                  {readers.map((reader, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                    >
                      <span>{reader.name}</span>
                      {reader.hasCard && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Error */}
              {(error || status.error) && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error || status.error}</AlertDescription>
                </Alert>
              )}

              {/* Last Checked */}
              {status.lastChecked && (
                <p className="text-xs text-muted-foreground text-right">
                  最終確認: {new Date(status.lastChecked).toLocaleTimeString()}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Signature Test Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSignature className="h-5 w-5" />
                署名テスト
              </CardTitle>
              <CardDescription>
                テキストデータに電子署名を行います
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>署名対象テキスト</Label>
                <Textarea
                  value={textData}
                  onChange={(e) => setTextData(e.target.value)}
                  placeholder="署名するテキストを入力..."
                  className="min-h-[120px] font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label>ICカードPIN</Label>
                <Input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="PINを入力"
                  maxLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  ※ PINは送信後すぐに破棄されます
                </p>
              </div>

              <Button
                onClick={handleSign}
                disabled={!status.connected || !status.cardInserted || signing}
                className="w-full"
              >
                {signing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    署名中...
                  </>
                ) : (
                  <>
                    <KeySquare className="h-4 w-4 mr-2" />
                    署名実行
                  </>
                )}
              </Button>

              {!status.connected && (
                <p className="text-sm text-amber-600">
                  ブリッジサーバーに接続してください
                </p>
              )}
              {status.connected && !status.cardInserted && (
                <p className="text-sm text-amber-600">
                  ICカードを挿入してください
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Signature Result */}
        {signatureResult && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    署名結果
                  </CardTitle>
                  <CardDescription>
                    電子署名が正常に生成されました
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={copySignature}>
                  <Copy className="h-4 w-4 mr-2" />
                  コピー
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">signature_hex:</p>
                <p className="font-mono text-sm break-all">{signatureResult}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
