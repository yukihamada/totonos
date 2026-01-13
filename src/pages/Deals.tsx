import { useState } from "react";
import { Plus, Target } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useDeals, useCreateDeal, useUpdateDeal } from "@/hooks/useCRM";
import { stageLabels, stageColors } from "@/types/crm";
import type { DealStage } from "@/types/crm";

const stages: DealStage[] = ['initial', 'proposal', 'negotiation', 'contract', 'won', 'lost'];

export default function Deals() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    deal_name: "",
    amount: 0,
    stage: "initial" as DealStage,
    probability: 10,
    expected_close_date: "",
  });

  const { data: deals = [], isLoading } = useDeals();
  const createDeal = useCreateDeal();
  const updateDeal = useUpdateDeal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDeal.mutateAsync(formData);
    setIsDialogOpen(false);
    setFormData({ deal_name: "", amount: 0, stage: "initial", probability: 10, expected_close_date: "" });
  };

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData("dealId", dealId);
  };

  const handleDrop = (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData("dealId");
    const probability = stage === 'won' ? 100 : stage === 'lost' ? 0 : stage === 'contract' ? 80 : stage === 'negotiation' ? 50 : stage === 'proposal' ? 30 : 10;
    updateDeal.mutate({ id: dealId, stage, probability });
  };

  const dealsByStage = stages.reduce((acc, stage) => {
    acc[stage] = deals.filter(d => d.stage === stage);
    return acc;
  }, {} as Record<DealStage, typeof deals>);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">商談パイプライン</h1>
            <p className="text-muted-foreground">商談をドラッグ&ドロップでステージ移動</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />商談を追加</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>新規商談登録</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label>商談名 *</Label><Input value={formData.deal_name} onChange={e => setFormData(f => ({ ...f, deal_name: e.target.value }))} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>金額</Label><Input type="number" value={formData.amount} onChange={e => setFormData(f => ({ ...f, amount: Number(e.target.value) }))} /></div>
                  <div>
                    <Label>ステージ</Label>
                    <Select value={formData.stage} onValueChange={v => setFormData(f => ({ ...f, stage: v as DealStage }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {stages.slice(0, 4).map(s => <SelectItem key={s} value={s}>{stageLabels[s]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>受注予定日</Label><Input type="date" value={formData.expected_close_date} onChange={e => setFormData(f => ({ ...f, expected_close_date: e.target.value }))} /></div>
                <Button type="submit" className="w-full" disabled={createDeal.isPending}>{createDeal.isPending ? "登録中..." : "登録"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8">読み込み中...</div>
        ) : (
          <div className="grid grid-cols-6 gap-4 overflow-x-auto">
            {stages.map(stage => (
              <div
                key={stage}
                className="min-w-[200px]"
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDrop(e, stage)}
              >
                <div className={`p-2 rounded-t-lg ${stageColors[stage]} font-medium text-center`}>
                  {stageLabels[stage]} ({dealsByStage[stage].length})
                </div>
                <div className="bg-muted/50 rounded-b-lg p-2 min-h-[400px] space-y-2">
                  {dealsByStage[stage].map(deal => (
                    <Card
                      key={deal.id}
                      draggable
                      onDragStart={e => handleDragStart(e, deal.id)}
                      className="cursor-move hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="p-3 pb-1">
                        <CardTitle className="text-sm font-medium truncate">{deal.deal_name}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-lg font-bold">¥{deal.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">確度: {deal.probability}%</p>
                      </CardContent>
                    </Card>
                  ))}
                  {dealsByStage[stage].length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      ここにドロップ
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
