import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ImportJob } from "@/types/import";

interface ImportProgressProps {
  job: ImportJob | null;
  progress: number;
  onClose: () => void;
  onRetry?: () => void;
}

export function ImportProgress({ job, progress, onClose, onRetry }: ImportProgressProps) {
  if (!job) return null;

  const getStatusIcon = () => {
    switch (job.status) {
      case 'completed':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'failed':
        return <XCircle className="h-12 w-12 text-destructive" />;
      case 'processing':
        return <Loader2 className="h-12 w-12 text-primary animate-spin" />;
      default:
        return <AlertCircle className="h-12 w-12 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (job.status) {
      case 'pending':
        return '準備中...';
      case 'processing':
        return 'インポート中...';
      case 'completed':
        return 'インポート完了';
      case 'failed':
        return 'インポート失敗';
      case 'cancelled':
        return 'キャンセルされました';
      default:
        return job.status;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {getStatusIcon()}
        </div>
        <CardTitle>{getStatusText()}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {job.status === 'processing' && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-center text-muted-foreground">
              {progress}% 完了
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{job.total_rows}</p>
            <p className="text-sm text-muted-foreground">総件数</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{job.processed_rows}</p>
            <p className="text-sm text-muted-foreground">成功</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-destructive">{job.error_rows}</p>
            <p className="text-sm text-muted-foreground">エラー</p>
          </div>
        </div>

        {job.error_summary && (job.error_summary as { sampleErrors?: string[] }).sampleErrors && (
          <div className="bg-destructive/10 rounded-lg p-3">
            <p className="text-sm font-medium text-destructive mb-2">エラー詳細:</p>
            <ul className="text-sm space-y-1">
              {((job.error_summary as { sampleErrors?: string[] }).sampleErrors || []).slice(0, 5).map((error, i) => (
                <li key={i} className="text-muted-foreground">• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          {job.status === 'failed' && onRetry && (
            <Button variant="outline" className="flex-1" onClick={onRetry}>
              再試行
            </Button>
          )}
          <Button 
            className="flex-1" 
            onClick={onClose}
            disabled={job.status === 'processing'}
          >
            {job.status === 'completed' ? '完了' : '閉じる'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
