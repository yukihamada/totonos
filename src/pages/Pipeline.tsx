import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDeals, useUpdateDeal } from "@/hooks/useCRM";
import { TrendingUp, TrendingDown, DollarSign, Target, Users, Loader2 } from "lucide-react";
import { formatCurrency } from "@/types/database";
import type { Database } from "@/integrations/supabase/types";

type DealStage = Database['public']['Enums']['deal_stage'];

const stageConfig: Record<DealStage, { label: string; color: string; bgColor: string }> = {
  initial: { label: '初期', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  proposal: { label: '提案中', color: 'text-orange-700', bgColor: 'bg-orange-50' },
  negotiation: { label: '交渉中', color: 'text-purple-700', bgColor: 'bg-purple-50' },
  contract: { label: '契約', color: 'text-yellow-700', bgColor: 'bg-yellow-50' },
  won: { label: '成約', color: 'text-green-700', bgColor: 'bg-green-50' },
  lost: { label: '失注', color: 'text-red-700', bgColor: 'bg-red-50' },
};

const stageOrder: DealStage[] = ['initial', 'proposal', 'negotiation', 'contract', 'won', 'lost'];

export default function Pipeline() {
  const { data: deals, isLoading } = useDeals();
  const updateDeal = useUpdateDeal();
  const [draggedDeal, setDraggedDeal] = useState<string | null>(null);

  // Calculate pipeline statistics
  const activeDeals = deals?.filter(d => d.stage !== 'won' && d.stage !== 'lost') || [];
  const totalPipelineValue = activeDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
  const weightedPipelineValue = activeDeals.reduce(
    (sum, d) => sum + (d.amount || 0) * ((d.probability || 0) / 100),
    0
  );
  const wonDeals = deals?.filter(d => d.stage === 'won') || [];
  const wonValue = wonDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
  const lostDeals = deals?.filter(d => d.stage === 'lost') || [];

  // Group deals by stage
  const dealsByStage = stageOrder.reduce((acc, stage) => {
    acc[stage] = deals?.filter(d => d.stage === stage) || [];
    return acc;
  }, {} as Record<DealStage, typeof deals>);

  const handleDragStart = (dealId: string) => {
    setDraggedDeal(dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (stage: DealStage) => {
    if (!draggedDeal) return;

    const deal = deals?.find(d => d.id === draggedDeal);
    if (deal && deal.stage !== stage) {
      await updateDeal.mutateAsync({
        id: draggedDeal,
        stage,
      });
    }
    setDraggedDeal(null);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">パイプライン</h1>
          <p className="text-muted-foreground">商談のステージ管理</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>パイプライン合計</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(totalPipelineValue)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{activeDeals.length}件の商談</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>加重パイプライン</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(weightedPipelineValue)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">確度加重後の予測値</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-2">
              <CardDescription className="text-green-700">成約</CardDescription>
              <CardTitle className="text-2xl text-green-700">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {formatCurrency(wonValue)}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-green-600">{wonDeals.length}件</p>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="pb-2">
              <CardDescription className="text-red-700">失注</CardDescription>
              <CardTitle className="text-2xl text-red-700">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  {lostDeals.length}件
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-red-600">
                {formatCurrency(lostDeals.reduce((sum, d) => sum + (d.amount || 0), 0))}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-6 gap-4 overflow-x-auto pb-4">
          {stageOrder.map(stage => {
            const config = stageConfig[stage];
            const stageDeals = dealsByStage[stage] || [];
            const stageValue = stageDeals.reduce((sum, d) => sum + (d.amount || 0), 0);

            return (
              <div
                key={stage}
                className={`min-h-[500px] rounded-lg border-2 ${config.bgColor} p-3`}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage)}
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold ${config.color}`}>{config.label}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {stageDeals.length}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(stageValue)}
                  </p>
                </div>

                <div className="space-y-2">
                  {stageDeals.map(deal => (
                    <Card
                      key={deal.id}
                      className="cursor-grab active:cursor-grabbing bg-white shadow-sm hover:shadow-md transition-shadow"
                      draggable
                      onDragStart={() => handleDragStart(deal.id)}
                    >
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div className="font-medium text-sm line-clamp-2">
                            {deal.deal_name}
                          </div>
                          {(deal as any).client?.name && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="h-3 w-3" />
                              {(deal as any).client.name}
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-sm font-semibold">
                              <DollarSign className="h-3 w-3" />
                              {formatCurrency(deal.amount || 0)}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {deal.probability}%
                            </Badge>
                          </div>
                          {deal.expected_close_date && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Target className="h-3 w-3" />
                              {new Date(deal.expected_close_date).toLocaleDateString('ja-JP')}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {stageDeals.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      商談をドラッグ&ドロップ
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
