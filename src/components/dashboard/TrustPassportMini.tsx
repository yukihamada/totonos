import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, TrendingUp } from "lucide-react";
import { TrustRank, getRankColor } from "@/types/database";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface TrustPassportMiniProps {
  score: number;
  rank: TrustRank;
  previousScore?: number;
}

export function TrustPassportMini({ score, rank, previousScore }: TrustPassportMiniProps) {
  const percentage = (score / 1000) * 100;
  const scoreChange = previousScore ? score - previousScore : 0;
  
  const nextRankThreshold = 
    rank === 'D' ? 300 :
    rank === 'C' ? 500 :
    rank === 'B' ? 700 :
    rank === 'A' ? 900 : 1000;
  
  const pointsToNextRank = nextRankThreshold - score;

  return (
    <Card className="border-2 border-foreground">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Trust Passport
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className={cn(
            "flex h-16 w-16 items-center justify-center border-2 border-foreground text-3xl font-bold",
            getRankColor(rank)
          )}>
            {rank}
          </div>
          <div>
            <div className="text-2xl font-bold">{score} / 1000</div>
            {scoreChange !== 0 && (
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className={cn(
                  "h-4 w-4",
                  scoreChange > 0 ? "text-chart-2" : "text-destructive"
                )} />
                <span className={scoreChange > 0 ? "text-chart-2" : "text-destructive"}>
                  {scoreChange > 0 ? "+" : ""}{scoreChange}ポイント
                </span>
                <span className="text-muted-foreground">先月比</span>
              </div>
            )}
          </div>
        </div>
        
        <Progress value={percentage} className="h-2 mb-2" />
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {rank !== 'S' && `${pointsToNextRank > 0 ? pointsToNextRank : 0}ポイントで次のランクへ`}
            {rank === 'S' && '最高ランク達成!'}
          </span>
          <Link to="/trust-passport">
            <Button variant="ghost" size="sm" className="text-xs">
              詳細を見る
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
