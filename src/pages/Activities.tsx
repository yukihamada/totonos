import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useActivities, useCreateActivity, useDeleteActivity, activityTypeLabels } from "@/hooks/useActivities";
import { useClients } from "@/hooks/useClients";
import { useLeads, useDeals } from "@/hooks/useCRM";
import { Plus, MoreHorizontal, Phone, Mail, Users, MapPin, Presentation, Calendar, Clock, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { Database } from "@/integrations/supabase/types";
import { LoadingWithTips } from "@/components/LoadingWithTips";

type ActivityType = Database['public']['Enums']['activity_type'];

const activityTypeConfig = {
  call: { label: '電話', icon: Phone, color: 'bg-blue-100 text-blue-800' },
  meeting: { label: '会議', icon: Users, color: 'bg-purple-100 text-purple-800' },
  email: { label: 'メール', icon: Mail, color: 'bg-green-100 text-green-800' },
  visit: { label: '訪問', icon: MapPin, color: 'bg-orange-100 text-orange-800' },
  demo: { label: 'デモ', icon: Presentation, color: 'bg-pink-100 text-pink-800' },
  other: { label: 'その他', icon: Calendar, color: 'bg-gray-100 text-gray-800' },
};

export default function Activities() {
  const { data: activities, isLoading } = useActivities();
  const { data: clients } = useClients();
  const { data: leads } = useLeads();
  const { data: deals } = useDeals();
  const createActivity = useCreateActivity();
  const deleteActivity = useDeleteActivity();

  const [isOpen, setIsOpen] = useState(false);
  const [activityType, setActivityType] = useState<ActivityType>('call');
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [activityDate, setActivityDate] = useState(new Date().toISOString().split('T')[0]);
  const [durationMinutes, setDurationMinutes] = useState<number | undefined>();
  const [relationType, setRelationType] = useState<'client' | 'lead' | 'deal' | ''>('');
  const [relationId, setRelationId] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [nextActionDate, setNextActionDate] = useState("");

  const handleSubmit = async () => {
    if (!subject) return;

    await createActivity.mutateAsync({
      activity_type: activityType,
      subject,
      description: description || null,
      activity_date: activityDate,
      duration_minutes: durationMinutes || null,
      client_id: relationType === 'client' ? relationId : null,
      lead_id: relationType === 'lead' ? relationId : null,
      deal_id: relationType === 'deal' ? relationId : null,
      next_action: nextAction || null,
      next_action_date: nextActionDate || null,
    });

    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setActivityType('call');
    setSubject("");
    setDescription("");
    setActivityDate(new Date().toISOString().split('T')[0]);
    setDurationMinutes(undefined);
    setRelationType('');
    setRelationId("");
    setNextAction("");
    setNextActionDate("");
  };

  // Calculate statistics
  const today = new Date().toISOString().split('T')[0];
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  const thisWeekStartStr = thisWeekStart.toISOString().split('T')[0];

  const todayActivities = activities?.filter(a => a.activity_date === today).length || 0;
  const weekActivities = activities?.filter(a => a.activity_date >= thisWeekStartStr).length || 0;
  const upcomingActions = activities?.filter(a => a.next_action_date && a.next_action_date >= today).length || 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">活動履歴</h1>
            <p className="text-muted-foreground">営業活動の記録と管理</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                活動を記録
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>活動を記録</DialogTitle>
                <DialogDescription>営業活動を記録します</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>活動タイプ *</Label>
                    <Select value={activityType} onValueChange={(v) => setActivityType(v as ActivityType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(activityTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>日付 *</Label>
                    <Input
                      type="date"
                      value={activityDate}
                      onChange={(e) => setActivityDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">件名 *</Label>
                  <Input
                    id="subject"
                    placeholder="活動の件名"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>関連先</Label>
                    <Select value={relationType} onValueChange={(v) => { setRelationType(v as any); setRelationId(""); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="関連先タイプを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">取引先</SelectItem>
                        <SelectItem value="lead">リード</SelectItem>
                        <SelectItem value="deal">商談</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    {relationType === 'client' && (
                      <Select value={relationId} onValueChange={setRelationId}>
                        <SelectTrigger>
                          <SelectValue placeholder="取引先を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients?.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {relationType === 'lead' && (
                      <Select value={relationId} onValueChange={setRelationId}>
                        <SelectTrigger>
                          <SelectValue placeholder="リードを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {leads?.map((lead) => (
                            <SelectItem key={lead.id} value={lead.id}>
                              {lead.company_name} ({lead.contact_name || ''})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {relationType === 'deal' && (
                      <Select value={relationId} onValueChange={setRelationId}>
                        <SelectTrigger>
                          <SelectValue placeholder="商談を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {deals?.map((deal) => (
                            <SelectItem key={deal.id} value={deal.id}>
                              {deal.deal_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {!relationType && (
                      <Input disabled placeholder="先に関連先タイプを選択" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>所要時間（分）</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="30"
                    value={durationMinutes || ''}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || undefined)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">詳細</Label>
                  <Textarea
                    id="description"
                    placeholder="活動の詳細を入力"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>次のアクション</Label>
                    <Input
                      placeholder="フォローアップ電話"
                      value={nextAction}
                      onChange={(e) => setNextAction(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>次のアクション日</Label>
                    <Input
                      type="date"
                      value={nextActionDate}
                      onChange={(e) => setNextActionDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleSubmit} disabled={createActivity.isPending}>
                  {createActivity.isPending ? "記録中..." : "記録"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>今日の活動</CardDescription>
              <CardTitle className="text-2xl">{isLoading ? "-" : todayActivities}件</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>今週の活動</CardDescription>
              <CardTitle className="text-2xl">{isLoading ? "-" : weekActivities}件</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>予定アクション</CardDescription>
              <CardTitle className="text-2xl">{isLoading ? "-" : upcomingActions}件</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>総活動数</CardDescription>
              <CardTitle className="text-2xl">{isLoading ? "-" : (activities?.length || 0)}件</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Activities List */}
        <Card>
          <CardHeader>
            <CardTitle>活動一覧</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingWithTips module="activities" columns={7} rows={5} />
            ) : activities?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                活動がありません。「活動を記録」から作成してください。
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>タイプ</TableHead>
                    <TableHead>件名</TableHead>
                    <TableHead>関連先</TableHead>
                    <TableHead>日付</TableHead>
                    <TableHead>所要時間</TableHead>
                    <TableHead>次のアクション</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities?.map((activity) => {
                    const config = activityTypeConfig[activity.activity_type];
                    const Icon = config.icon;
                    const relatedTo =
                      (activity as any).client?.name ||
                      (activity as any).lead?.company_name ||
                      (activity as any).deal?.deal_name ||
                      "-";

                    return (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <Badge className={`gap-1 ${config.color}`}>
                            <Icon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{activity.subject}</div>
                            {activity.description && (
                              <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {activity.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{relatedTo}</TableCell>
                        <TableCell>
                          {format(new Date(activity.activity_date), "yyyy/MM/dd", { locale: ja })}
                        </TableCell>
                        <TableCell>
                          {activity.duration_minutes ? (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {activity.duration_minutes}分
                            </div>
                          ) : "-"}
                        </TableCell>
                        <TableCell>
                          {activity.next_action ? (
                            <div>
                              <div className="text-sm">{activity.next_action}</div>
                              {activity.next_action_date && (
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(activity.next_action_date), "MM/dd", { locale: ja })}
                                </div>
                              )}
                            </div>
                          ) : "-"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => deleteActivity.mutate(activity.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                削除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
