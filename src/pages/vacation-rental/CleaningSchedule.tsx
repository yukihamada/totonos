import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Sparkles, Plus, CheckCircle2, Clock, Home, 
  Calendar, User, Camera, ChevronRight
} from 'lucide-react';
import { 
  useCleaningTasks, 
  useVacationProperties, 
  useCreateCleaningTask,
  useUpdateCleaningTask,
  useCompleteCleaningTask,
  type ChecklistItem
} from '@/hooks/useVacationRental';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: '1', label: 'ゴミの回収', completed: false },
  { id: '2', label: 'ベッドメイキング', completed: false },
  { id: '3', label: 'タオル交換', completed: false },
  { id: '4', label: 'バスルーム清掃', completed: false },
  { id: '5', label: 'キッチン清掃', completed: false },
  { id: '6', label: '掃除機がけ', completed: false },
  { id: '7', label: '備品補充', completed: false },
  { id: '8', label: '最終チェック', completed: false },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: '待機中', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20', icon: Clock },
  in_progress: { label: '作業中', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: Sparkles },
  completed: { label: '完了', color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: CheckCircle2 },
};

export default function CleaningSchedule() {
  const { data: tasks, isLoading: tasksLoading } = useCleaningTasks();
  const { data: properties, isLoading: propertiesLoading } = useVacationProperties();
  const createTask = useCreateCleaningTask();
  const updateTask = useUpdateCleaningTask();
  const completeTask = useCompleteCleaningTask();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<any>(null);
  const [formData, setFormData] = useState({
    property_id: '',
    scheduled_date: format(new Date(), 'yyyy-MM-dd'),
    scheduled_time: '11:00',
    assigned_to: '',
  });

  const isLoading = tasksLoading || propertiesLoading;

  const pendingTasks = tasks?.filter((t) => t.status === 'pending') || [];
  const inProgressTasks = tasks?.filter((t) => t.status === 'in_progress') || [];
  const completedTasks = tasks?.filter((t) => t.status === 'completed') || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTask.mutateAsync({
      ...formData,
      checklist: DEFAULT_CHECKLIST,
    });
    setDialogOpen(false);
    setFormData({
      property_id: '',
      scheduled_date: format(new Date(), 'yyyy-MM-dd'),
      scheduled_time: '11:00',
      assigned_to: '',
    });
  };

  const handleChecklistUpdate = async (taskId: string, checklist: ChecklistItem[], itemId: string) => {
    const updatedChecklist = checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    await updateTask.mutateAsync({
      id: taskId,
      checklist: updatedChecklist,
    });
    if (detailTask) {
      setDetailTask({ ...detailTask, checklist: updatedChecklist });
    }
  };

  const handleStartTask = async (taskId: string) => {
    await updateTask.mutateAsync({
      id: taskId,
      status: 'in_progress',
    });
  };

  const handleCompleteTask = async (taskId: string) => {
    await completeTask.mutateAsync(taskId);
    setDetailTask(null);
  };

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return '今日';
    if (isTomorrow(date)) return '明日';
    if (isPast(date)) return '期限切れ';
    return format(date, 'M/d (E)', { locale: ja });
  };

  const TaskCard = ({ task }: { task: any }) => {
    const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
    const StatusIcon = status.icon;

    return (
      <Card 
        className="cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => setDetailTask(task)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{task.property?.name || '物件'}</span>
            </div>
            <Badge variant="outline" className={status.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{getDateLabel(task.scheduled_date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{task.scheduled_time}</span>
            </div>
            {task.assigned_to && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{task.assigned_to}</span>
              </div>
            )}
          </div>
          {task.checklist && task.checklist.length > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">
              {task.checklist.filter((c: ChecklistItem) => c.completed).length} / {task.checklist.length} 完了
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">清掃スケジュール</h1>
            <p className="text-muted-foreground mt-1">
              清掃タスクの管理とチェックリスト
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                タスク追加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>清掃タスク追加</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="property">物件 *</Label>
                  <Select
                    value={formData.property_id}
                    onValueChange={(value) => setFormData({ ...formData, property_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="物件を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties?.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduled_date">予定日 *</Label>
                    <Input
                      id="scheduled_date"
                      type="date"
                      value={formData.scheduled_date}
                      onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="scheduled_time">予定時刻</Label>
                    <Input
                      id="scheduled_time"
                      type="time"
                      value={formData.scheduled_time}
                      onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="assigned_to">担当者</Label>
                  <Input
                    id="assigned_to"
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    placeholder="担当者名を入力"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    キャンセル
                  </Button>
                  <Button type="submit" disabled={createTask.isPending}>
                    {createTask.isPending ? '作成中...' : '作成する'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        ) : (
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="pending">
                待機中 ({pendingTasks.length})
              </TabsTrigger>
              <TabsTrigger value="in_progress">
                作業中 ({inProgressTasks.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                完了 ({completedTasks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {pendingTasks.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">待機中のタスクはありません</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pendingTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="in_progress">
              {inProgressTasks.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">作業中のタスクはありません</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {inProgressTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {completedTasks.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">完了したタスクはありません</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {completedTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Task Detail Dialog */}
        <Dialog open={!!detailTask} onOpenChange={(open) => !open && setDetailTask(null)}>
          <DialogContent className="max-w-lg">
            {detailTask && (
              <>
                <DialogHeader>
                  <DialogTitle>{detailTask.property?.name || '清掃タスク'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="outline" className={STATUS_CONFIG[detailTask.status]?.color}>
                      {STATUS_CONFIG[detailTask.status]?.label}
                    </Badge>
                    <span>{format(parseISO(detailTask.scheduled_date), 'yyyy年M月d日', { locale: ja })}</span>
                    <span>{detailTask.scheduled_time}</span>
                  </div>
                  {detailTask.assigned_to && (
                    <div className="text-sm text-muted-foreground">
                      担当: {detailTask.assigned_to}
                    </div>
                  )}

                  {/* Checklist */}
                  <div className="space-y-2">
                    <h4 className="font-medium">チェックリスト</h4>
                    {(detailTask.checklist || []).map((item: ChecklistItem) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() => handleChecklistUpdate(detailTask.id, detailTask.checklist, item.id)}
                          disabled={detailTask.status === 'completed'}
                        />
                        <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    {detailTask.status === 'pending' && (
                      <Button onClick={() => handleStartTask(detailTask.id)} className="flex-1">
                        作業開始
                      </Button>
                    )}
                    {detailTask.status === 'in_progress' && (
                      <Button onClick={() => handleCompleteTask(detailTask.id)} className="flex-1">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        完了にする
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => setDetailTask(null)}>
                      閉じる
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
