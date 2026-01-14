import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LayoutGrid,
  List,
  Calendar,
  GanttChart,
  Plus,
  Search,
  Filter,
  SortAsc,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: string;
  startDate: string;
  tags: string[];
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: '新機能の要件定義',
    status: 'done',
    priority: 'high',
    assignee: '山田太郎',
    dueDate: '2024-03-15',
    startDate: '2024-03-01',
    tags: ['企画', '重要'],
  },
  {
    id: '2',
    title: 'APIエンドポイント設計',
    status: 'done',
    priority: 'high',
    assignee: '鈴木花子',
    dueDate: '2024-03-20',
    startDate: '2024-03-10',
    tags: ['開発', 'API'],
  },
  {
    id: '3',
    title: 'フロントエンド実装',
    status: 'in_progress',
    priority: 'high',
    assignee: '田中一郎',
    dueDate: '2024-03-30',
    startDate: '2024-03-18',
    tags: ['開発', 'UI'],
  },
  {
    id: '4',
    title: 'ユニットテスト作成',
    status: 'in_progress',
    priority: 'medium',
    assignee: '佐藤次郎',
    dueDate: '2024-04-05',
    startDate: '2024-03-25',
    tags: ['テスト'],
  },
  {
    id: '5',
    title: 'コードレビュー',
    status: 'review',
    priority: 'medium',
    assignee: '山田太郎',
    dueDate: '2024-04-10',
    startDate: '2024-04-01',
    tags: ['レビュー'],
  },
  {
    id: '6',
    title: 'ドキュメント作成',
    status: 'todo',
    priority: 'low',
    assignee: '鈴木花子',
    dueDate: '2024-04-15',
    startDate: '2024-04-10',
    tags: ['ドキュメント'],
  },
  {
    id: '7',
    title: '本番環境デプロイ',
    status: 'todo',
    priority: 'high',
    assignee: '田中一郎',
    dueDate: '2024-04-20',
    startDate: '2024-04-18',
    tags: ['デプロイ', '重要'],
  },
  {
    id: '8',
    title: 'パフォーマンス最適化',
    status: 'todo',
    priority: 'medium',
    assignee: '佐藤次郎',
    dueDate: '2024-04-25',
    startDate: '2024-04-20',
    tags: ['最適化'],
  },
];

const statusConfig = {
  todo: { label: 'To Do', icon: Circle, color: 'text-gray-500' },
  in_progress: { label: '進行中', icon: Clock, color: 'text-blue-500' },
  review: { label: 'レビュー', icon: AlertCircle, color: 'text-amber-500' },
  done: { label: '完了', icon: CheckCircle2, color: 'text-green-500' },
};

const priorityConfig = {
  low: { label: '低', color: 'bg-gray-100 text-gray-700' },
  medium: { label: '中', color: 'bg-blue-100 text-blue-700' },
  high: { label: '高', color: 'bg-red-100 text-red-700' },
};

// Table View Component
function TableView({ tasks }: { tasks: Task[] }) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">タスク</TableHead>
            <TableHead>ステータス</TableHead>
            <TableHead>優先度</TableHead>
            <TableHead>担当者</TableHead>
            <TableHead>期限</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const StatusIcon = statusConfig[task.status].icon;
            return (
              <TableRow key={task.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <div className="flex gap-1 mt-1">
                      {task.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className={cn('flex items-center gap-1', statusConfig[task.status].color)}>
                    <StatusIcon className="h-4 w-4" />
                    <span className="text-sm">{statusConfig[task.status].label}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={priorityConfig[task.priority].color}>
                    {priorityConfig[task.priority].label}
                  </Badge>
                </TableCell>
                <TableCell>{task.assignee}</TableCell>
                <TableCell>{new Date(task.dueDate).toLocaleDateString('ja-JP')}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// Board View Component
function BoardView({ tasks }: { tasks: Task[] }) {
  const columns = ['todo', 'in_progress', 'review', 'done'] as const;

  return (
    <div className="grid grid-cols-4 gap-4">
      {columns.map((status) => {
        const config = statusConfig[status];
        const StatusIcon = config.icon;
        const columnTasks = tasks.filter((t) => t.status === status);

        return (
          <div key={status} className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <StatusIcon className={cn('h-4 w-4', config.color)} />
                <span className="font-medium text-sm">{config.label}</span>
                <Badge variant="secondary" className="ml-1">
                  {columnTasks.length}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {columnTasks.map((task) => (
                <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <p className="font-medium text-sm mb-2">{task.title}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1 flex-wrap">
                        {task.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Badge className={cn('text-xs', priorityConfig[task.priority].color)}>
                        {priorityConfig[task.priority].label}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>{task.assignee}</span>
                      <span>{new Date(task.dueDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Calendar View Component
function CalendarView({ tasks }: { tasks: Task[] }) {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 2, 1)); // March 2024

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDay }, (_, i) => null);

  const getTasksForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter((t) => t.dueDate === dateStr);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">
          {currentDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
          <div key={day} className="text-center text-sm font-medium py-2 text-muted-foreground">
            {day}
          </div>
        ))}

        {[...paddingDays, ...days].map((day, index) => {
          const dayTasks = day ? getTasksForDay(day) : [];
          return (
            <div
              key={index}
              className={cn(
                'min-h-[100px] border rounded p-1',
                day ? 'bg-background' : 'bg-muted/30'
              )}
            >
              {day && (
                <>
                  <span className="text-sm font-medium">{day}</span>
                  <div className="space-y-1 mt-1">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          'text-xs p-1 rounded truncate',
                          task.status === 'done'
                            ? 'bg-green-100 text-green-700'
                            : task.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        )}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-xs text-muted-foreground">+{dayTasks.length - 3}件</span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Gantt View Component
function GanttView({ tasks }: { tasks: Task[] }) {
  const startDate = new Date('2024-03-01');
  const endDate = new Date('2024-04-30');
  const days = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const getBarPosition = (task: Task) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.dueDate);
    const totalDays = days.length;

    const startIndex = Math.max(
      0,
      Math.floor((taskStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    const duration = Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return {
      left: `${(startIndex / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`,
    };
  };

  const getWeeks = () => {
    const weeks: { start: Date; label: string }[] = [];
    let current = new Date(startDate);
    while (current <= endDate) {
      if (current.getDay() === 0 || current.getTime() === startDate.getTime()) {
        weeks.push({
          start: new Date(current),
          label: current.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
        });
      }
      current.setDate(current.getDate() + 1);
    }
    return weeks;
  };

  const weeks = getWeeks();

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex border-b bg-muted/50">
        <div className="w-64 min-w-64 p-3 border-r font-medium">タスク</div>
        <div className="flex-1 relative">
          <div className="flex">
            {weeks.map((week, i) => (
              <div
                key={i}
                className="flex-1 p-2 text-sm text-center border-r last:border-r-0"
                style={{ minWidth: '100px' }}
              >
                {week.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rows */}
      {tasks.map((task) => {
        const position = getBarPosition(task);
        const StatusIcon = statusConfig[task.status].icon;

        return (
          <div key={task.id} className="flex border-b last:border-b-0">
            <div className="w-64 min-w-64 p-3 border-r">
              <div className="flex items-center gap-2">
                <StatusIcon className={cn('h-4 w-4', statusConfig[task.status].color)} />
                <span className="text-sm truncate">{task.title}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{task.assignee}</p>
            </div>
            <div className="flex-1 relative h-16">
              <div
                className={cn(
                  'absolute top-4 h-8 rounded flex items-center px-2',
                  task.status === 'done'
                    ? 'bg-green-500'
                    : task.priority === 'high'
                    ? 'bg-red-500'
                    : task.priority === 'medium'
                    ? 'bg-blue-500'
                    : 'bg-gray-400'
                )}
                style={position}
              >
                <span className="text-xs text-white truncate">{task.title}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DatabaseViews() {
  const [view, setView] = useState<'table' | 'board' | 'calendar' | 'gantt'>('table');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = mockTasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">プロジェクトタスク</h1>
            <p className="text-muted-foreground">
              複数のビューでタスクを管理（Notion風）
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新規タスク
          </Button>
        </div>

        {/* View Selector & Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
                <TabsList>
                  <TabsTrigger value="table" className="gap-2">
                    <List className="h-4 w-4" />
                    テーブル
                  </TabsTrigger>
                  <TabsTrigger value="board" className="gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    ボード
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    カレンダー
                  </TabsTrigger>
                  <TabsTrigger value="gantt" className="gap-2">
                    <GanttChart className="h-4 w-4" />
                    ガント
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="タスクを検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <SortAsc className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Content */}
        <div>
          {view === 'table' && <TableView tasks={filteredTasks} />}
          {view === 'board' && <BoardView tasks={filteredTasks} />}
          {view === 'calendar' && <CalendarView tasks={filteredTasks} />}
          {view === 'gantt' && <GanttView tasks={filteredTasks} />}
        </div>
      </div>
    </AppLayout>
  );
}
