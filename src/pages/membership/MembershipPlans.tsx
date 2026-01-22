import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, CreditCard, MoreVertical, Edit, Trash2, Check } from "lucide-react";
import { useMembershipPlans } from "@/hooks/useMembership";

export default function MembershipPlans() {
  const { plans, isLoading, createPlan, updatePlan, deletePlan } = useMembershipPlans();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<typeof plans[0] | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [planType, setPlanType] = useState("monthly");
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [includedClasses, setIncludedClasses] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(true);

  const handleOpenDialog = (plan?: typeof plans[0]) => {
    if (plan) {
      setEditingPlan(plan);
      setName(plan.name);
      setPlanType(plan.plan_type || "monthly");
      setPrice(plan.price || 0);
      setDescription(plan.description || "");
      setBillingCycle(plan.billing_cycle || "monthly");
      setIncludedClasses(plan.included_classes);
      setIsActive(plan.is_active ?? true);
    } else {
      setEditingPlan(null);
      setName("");
      setPlanType("monthly");
      setPrice(0);
      setDescription("");
      setBillingCycle("monthly");
      setIncludedClasses(null);
      setIsActive(true);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    
    if (editingPlan) {
      await updatePlan.mutateAsync({
        id: editingPlan.id,
        name,
        plan_type: planType,
        price,
        description,
        billing_cycle: billingCycle,
        included_classes: includedClasses,
        is_active: isActive,
      });
    } else {
      await createPlan.mutateAsync({
        name,
        plan_type: planType,
        price,
        description,
        billing_cycle: billingCycle,
        included_classes: includedClasses || undefined,
      });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("このプランを削除してもよろしいですか？")) {
      await deletePlan.mutateAsync(id);
    }
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return "無料";
    return `¥${price.toLocaleString()}`;
  };

  const getBillingCycleLabel = (cycle: string | null) => {
    switch (cycle) {
      case "monthly": return "月額";
      case "yearly": return "年額";
      case "once": return "一回払い";
      default: return cycle;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CreditCard className="h-8 w-8" />
              プラン管理
            </h1>
            <p className="text-muted-foreground">会員プランの設定と料金管理</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                新規プラン
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingPlan ? "プラン編集" : "新規プラン作成"}</DialogTitle>
                <DialogDescription>
                  プランの詳細を入力してください
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">プラン名 *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="スタンダードプラン"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="planType">プランタイプ</Label>
                    <Select value={planType} onValueChange={setPlanType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">月額会員</SelectItem>
                        <SelectItem value="yearly">年間会員</SelectItem>
                        <SelectItem value="drop_in">ドロップイン</SelectItem>
                        <SelectItem value="ticket">回数券</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billingCycle">支払いサイクル</Label>
                    <Select value={billingCycle} onValueChange={setBillingCycle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">毎月</SelectItem>
                        <SelectItem value="yearly">毎年</SelectItem>
                        <SelectItem value="once">一回のみ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">料金（円）</Label>
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      min={0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="includedClasses">含まれるクラス数</Label>
                    <Input
                      id="includedClasses"
                      type="number"
                      value={includedClasses || ""}
                      onChange={(e) => setIncludedClasses(e.target.value ? Number(e.target.value) : null)}
                      placeholder="無制限"
                      min={0}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">説明</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="プランの特典や詳細"
                    rows={3}
                  />
                </div>
                {editingPlan && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>有効</Label>
                      <p className="text-sm text-muted-foreground">プランを新規申し込み可能にする</p>
                    </div>
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleSubmit} disabled={!name.trim()}>
                  {editingPlan ? "更新" : "作成"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Plans Grid */}
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              読み込み中...
            </CardContent>
          </Card>
        ) : plans.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              プランがまだ登録されていません
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${!plan.is_active ? "opacity-60" : ""}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>
                        {plan.description || "説明なし"}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(plan)}>
                          <Edit className="h-4 w-4 mr-2" />
                          編集
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(plan.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">
                    {formatPrice(plan.price)}
                    <span className="text-base font-normal text-muted-foreground">
                      /{getBillingCycleLabel(plan.billing_cycle)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {plan.included_classes && (
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        <span>月{plan.included_classes}回のクラス</span>
                      </div>
                    )}
                    {!plan.included_classes && (
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        <span>クラス無制限</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Badge variant={plan.is_active ? "default" : "secondary"}>
                      {plan.is_active ? "有効" : "無効"}
                    </Badge>
                    <Badge variant="outline">
                      {plan.plan_type === "monthly" ? "月額" : 
                       plan.plan_type === "yearly" ? "年間" :
                       plan.plan_type === "drop_in" ? "ドロップイン" : "回数券"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
