import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-4 max-w-md">
        {/* 404 Number with gradient */}
        <div className="relative mb-8">
          <h1 className="text-[120px] md:text-[180px] font-bold leading-none text-primary/10">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="h-16 w-16 md:h-24 md:w-24 text-primary/50" />
          </div>
        </div>

        {/* Message */}
        <h2 className="mb-3 text-2xl md:text-3xl font-bold text-foreground">
          ページが見つかりません
        </h2>
        <p className="mb-8 text-muted-foreground">
          お探しのページは存在しないか、移動した可能性があります。
          <br />
          <span className="text-sm">
            アクセスしようとしたパス: <code className="bg-muted px-2 py-1 rounded text-xs">{location.pathname}</code>
          </span>
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default" size="lg">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              ホームに戻る
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" onClick={() => window.history.back()}>
            <button type="button" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              前のページへ
            </button>
          </Button>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-muted-foreground">
          問題が続く場合は、
          <Link to="/auth" className="text-primary hover:underline">
            ログイン
          </Link>
          してサポートにお問い合わせください。
        </p>
      </div>
    </div>
  );
};

export default NotFound;
