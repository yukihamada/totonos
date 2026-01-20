import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Apple, Monitor, ExternalLink } from "lucide-react";

interface HpkiBridgeDownloadProps {
  variant?: "card" | "inline" | "compact";
  showTitle?: boolean;
}

// GitHub Release URLs (replace with actual release URLs when available)
const DOWNLOAD_URLS = {
  mac: "https://github.com/totonos/hpki-bridge/releases/latest/download/hpki-bridge-macos.dmg",
  windows: "https://github.com/totonos/hpki-bridge/releases/latest/download/hpki-bridge-windows.exe",
  source: "https://github.com/totonos/hpki-bridge",
};

export function HpkiBridgeDownload({ variant = "card", showTitle = true }: HpkiBridgeDownloadProps) {
  if (variant === "compact") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <a href={DOWNLOAD_URLS.mac} target="_blank" rel="noopener noreferrer">
            <Apple className="h-4 w-4 mr-1" />
            Mac
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild>
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
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span className="font-medium text-sm">HPKIブリッジアプリ</span>
          <Badge variant="secondary" className="text-xs">HPKI署名に必要</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          電子署名機能を使用するには、ローカルブリッジアプリのインストールが必要です。
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={DOWNLOAD_URLS.mac} target="_blank" rel="noopener noreferrer">
              <Apple className="h-4 w-4 mr-1" />
              macOS版
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={DOWNLOAD_URLS.windows} target="_blank" rel="noopener noreferrer">
              <Monitor className="h-4 w-4 mr-1" />
              Windows版
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
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            HPKIブリッジアプリ
          </CardTitle>
          <CardDescription>
            HPKI電子署名機能を使用するには、ローカルブリッジアプリのインストールが必要です。
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className={showTitle ? "" : "pt-6"}>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" className="h-auto py-4 justify-start" asChild>
              <a href={DOWNLOAD_URLS.mac} target="_blank" rel="noopener noreferrer">
                <Apple className="h-6 w-6 mr-3" />
                <div className="text-left">
                  <p className="font-medium">macOS版</p>
                  <p className="text-xs text-muted-foreground">Intel / Apple Silicon対応</p>
                </div>
              </a>
            </Button>
            <Button variant="outline" className="h-auto py-4 justify-start" asChild>
              <a href={DOWNLOAD_URLS.windows} target="_blank" rel="noopener noreferrer">
                <Monitor className="h-6 w-6 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Windows版</p>
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
