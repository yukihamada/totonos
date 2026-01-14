import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useVerifyPayment } from "@/hooks/useStripePayment";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const invoiceId = searchParams.get("invoice_id");
  
  const verifyPayment = useVerifyPayment();
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId && invoiceId && !verified) {
      verifyPayment.mutate(
        { sessionId, invoiceId },
        {
          onSuccess: (data) => {
            if (data.paid) {
              setVerified(true);
            } else {
              setError("お支払いが完了していません");
            }
          },
          onError: (err) => {
            setError(err.message);
          },
        }
      );
    }
  }, [sessionId, invoiceId]);

  if (verifyPayment.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">お支払いを確認しています...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-destructive" />
            </div>
            <CardTitle className="text-2xl">エラーが発生しました</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link to="/invoices">請求書一覧に戻る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">お支払いが完了しました</CardTitle>
          <CardDescription>
            ご入金いただきありがとうございます。
            <br />
            請求書のステータスが更新されました。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link to="/invoices">請求書一覧に戻る</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/dashboard">ダッシュボードに戻る</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
