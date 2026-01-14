import { Link } from 'react-router-dom';
import { Coins, Sparkles } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function CreditBadge() {
  const { credits, totalRemaining, isLoading } = useCredits();

  if (isLoading || !credits) {
    return null;
  }

  const isLow = totalRemaining < 20;
  const isCritical = totalRemaining < 5;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to="/credits"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isCritical
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : isLow
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : 'bg-primary/10 text-primary hover:bg-primary/20'
            }`}
          >
            {isCritical ? (
              <Coins className="h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>{totalRemaining.toLocaleString()}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-medium">残りクレジット</p>
            <p className="text-xs text-muted-foreground">
              クリックして詳細を表示
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
