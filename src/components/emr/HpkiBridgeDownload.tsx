import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Apple, Monitor, ExternalLink, CheckCircle, XCircle, Loader2, RefreshCw, Wifi } from "lucide-react";

interface HpkiBridgeDownloadProps {
  variant?: "card" | "inline" | "compact";
  showTitle?: boolean;
  showConnectionTest?: boolean;
}

// GitHub Release URLs
const DOWNLOAD_URLS = {
  mac: "https://github.com/yukihamada/totonos/releases/download/hpki-bridge-v1.0.0/hpki-bridge-macos.dmg",
  windows: "https://github.com/yukihamada/totonos/releases/download/hpki-bridge-v1.0.0/hpki-bridge-windows.exe",
  source: "https://github.com/yukihamada/totonos/tree/main/hpki-bridge",
};

const BRIDGE_URL = "http://localhost:8000";

type ConnectionStatus = "unknown" | "checking" | "connected" | "disconnected";

function detectOS(): "mac" | "windows" | "other" {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes("mac")) return "mac";
  if (userAgent.includes("win")) return "windows";
  return "other";
}

export function HpkiBridgeDownload({
  variant = "card",
  showTitle = true,
  showConnectionTest = true,
}: HpkiBridgeDownloadProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("unknown");
  const [currentOS] = useState(detectOS);

  const checkConnection = async () => {
    setConnectionStatus("checking");
    try {
      const response = await fetch(`${BRIDGE_URL}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(3000),
      });
      if (response.ok) {
        const data = await response.json();
        setConnectionStatus(data.status === "ok" ? "connected" : "disconnected");
      } else {
        setConnectionStatus("disconnected");
      }
    } catch {
      setConnectionStatus("disconnected");
    }
  };

  useEffect(() => {
    if (showConnectionTest) {
      checkConnection();
    }
  }, [showConnectionTest]);

  const ConnectionStatusBadge = () => {
    switch (connectionStatus) {
      case "checking":
        return (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            確認中
          </Badge>
        );
      case "connected":
        return (
          <Badge variant="default" className="gap-1 bg-green-500 hover:bg-green-500">
            <CheckCircle className="h-3 w-3" />
            接続済み
          </Badge>
        );
      case "disconnected":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            未接続
          </Badge>
        );
      default:
        return null;
    }
  };

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {showConnectionTest && <ConnectionStatusBadge />}
        <Button
          variant={currentOS === "mac" ? "default" : "outline"}
          size="sm"
          asChild
        >
          <a href={DOWNLOAD_URLS.mac} target="_blank" rel="noopener noreferrer">
            <Apple className="h-4 w-4 mr-1" />
            Mac
          </a>
        </Button>
        <Button
          variant={currentOS === "windows" ? "default" : "outline"}
          size="sm"
          asChild
        >
          <a href={DOWNLOAD_URLS.windows} target="_blank" rel="noopener noreferrer">
            <Monitor className="h-4 w-4 mr-1" />
            Windows
          </a>
        </Button>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className="flex flex-col gap-3 p-4 border rounded-lg bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="font-medium text-sm">HPKIブリッジアプリ</span>
            <Badge variant="secondary" className="text-xs">HPKI署名に必要</Badge>
          </div>
          {showConnectionTest && <ConnectionStatusBadge />}
        </div>
        <p className="text-xs text-muted-foreground">
          電子署名機能を使用するには、ローカルブリッジアプリのインストールが必要です。
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={currentOS === "mac" ? "default" : "outline"}
            size="sm"
            asChild
          >
            <a href={DOWNLOAD_URLS.mac} target="_blank" rel="noopener noreferrer">
              <Apple className="h-4 w-4 mr-1" />
              macOS版 {currentOS === "mac" && "(推奨)"}
            </a>
          </Button>
          <Button
            variant={currentOS === "windows" ? "default" : "outline"}
            size="sm"
            asChild
          >
            <a href={DOWNLOAD_URLS.windows} target="_blank" rel="noopener noreferrer">
              <Monitor className="h-4 w-4 mr-1" />
              Windows版 {currentOS === "windows" && "(推奨)"}
            </a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href={DOWNLOAD_URLS.source} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" />
              ソースコード
            </a>
          </Button>
        </div>
      </div>
    );
  }

  // Default: card variant
  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                HPKIブリッジアプリ
              </CardTitle>
              <CardDescription>
                HPKI電子署名機能を使用するには、ローカルブリッジアプリのインストールが必要です。
              </CardDescription>
            </div>
            {showConnectionTest && (
              <div className="flex items-center gap-2">
                <ConnectionStatusBadge />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={checkConnection}
                  disabled={connectionStatus === "checking"}
                >
                  <RefreshCw className={`h-4 w-4 ${connectionStatus === "checking" ? "animate-spin" : ""}`} />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className={showTitle ? "" : "pt-6"}>
        <div className="space-y-4">
          {/* Connection Status Alert */}
          {showConnectionTest && connectionStatus === "connected" && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <Wifi className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                HPKIブリッジに接続されています。ICカードリーダーを接続して署名を行えます。
              </AlertDescription>
            </Alert>
          )}

          {showConnectionTest && connectionStatus === "disconnected" && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                HPKIブリッジに接続できません。アプリをダウンロードして起動してください。
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              variant={currentOS === "mac" ? "default" : "outline"}
              className="h-auto py-4 justify-start"
              asChild
            >
              <a href={DOWNLOAD_URLS.mac} target="_blank" rel="noopener noreferrer">
                <Apple className="h-6 w-6 mr-3" />
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">macOS版</p>
                    {currentOS === "mac" && (
                      <Badge variant="secondary" className="text-xs">推奨</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Intel / Apple Silicon対応</p>
                </div>
              </a>
            </Button>
            <Button
              variant={currentOS === "windows" ? "default" : "outline"}
              className="h-auto py-4 justify-start"
              asChild
            >
              <a href={DOWNLOAD_URLS.windows} target="_blank" rel="noopener noreferrer">
                <Monitor className="h-6 w-6 mr-3" />
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">Windows版</p>
                    {currentOS === "windows" && (
                      <Badge variant="secondary" className="text-xs">推奨</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Windows 10/11 64bit</p>
                </div>
              </a>
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              <a
                href={DOWNLOAD_URLS.source}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                GitHubでソースコードを見る
              </a>
            </p>
          </div>
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            <p>※ インストール後、アプリを起動してからHPKI署名機能をご利用ください。</p>
            <p>※ ICカードリーダーとHPKIカードが別途必要です。</p>
            <p>※ OpenSCドライバが必要です（<a href="https://github.com/OpenSC/OpenSC/releases" target="_blank" rel="noopener noreferrer" className="underline">ダウンロード</a>）</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
