import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MessageSquare, Link2, Bell, Settings, CheckCircle2, XCircle } from "lucide-react";

export default function GoogleChatIntegration() {
  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Google Chat連携</h1>
            <p className="text-muted-foreground">
              Google Chatとの連携設定を管理します
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            未接続
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                接続設定
              </CardTitle>
              <CardDescription>
                Google Chatアプリの接続情報を設定します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://chat.googleapis.com/v1/spaces/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="space-id">スペースID</Label>
                <Input id="space-id" placeholder="spaces/XXXXXXXXX" />
              </div>
              <Button className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" />
                接続をテスト
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                通知設定
              </CardTitle>
              <CardDescription>
                Google Chatに送信する通知を設定します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">新規リード</p>
                  <p className="text-sm text-muted-foreground">
                    新しいリードが登録された時
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">商談成約</p>
                  <p className="text-sm text-muted-foreground">
                    商談がクローズした時
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">請求書発行</p>
                  <p className="text-sm text-muted-foreground">
                    請求書が発行された時
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">入金確認</p>
                  <p className="text-sm text-muted-foreground">
                    入金が確認された時
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              高度な設定
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">メンション機能</p>
                <p className="text-sm text-muted-foreground">
                  担当者をメンションして通知します
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">スレッド返信</p>
                <p className="text-sm text-muted-foreground">
                  関連する通知をスレッドにまとめます
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
