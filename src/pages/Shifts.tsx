import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEmployees, useAttendanceRecords } from '@/hooks/useHR';
import { ChevronLeft, ChevronRight, Clock, User, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Database } from '@/integrations/supabase/types';

type AttendanceStatus = Database['public']['Enums']['attendance_status'];

const statusConfig: Record<AttendanceStatus, { label: string; color: string; short: string }> = {
  present: { label: '出勤', color: 'bg-green-100 text-green-800', short: '出' },
  absent: { label: '欠勤', color: 'bg-red-100 text-red-800', short: '欠' },
  paid_leave: { label: '有給', color: 'bg-blue-100 text-blue-800', short: '有' },
  sick_leave: { label: '病欠', color: 'bg-orange-100 text-orange-800', short: '病' },
  remote: { label: 'リモート', color: 'bg-purple-100 text-purple-800', short: 'R' },
  half_day: { label: '半休', color: 'bg-yellow-100 text-yellow-800', short: '半' },
};

const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

export default function Shifts() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');

  const { data: employees } = useEmployees();
  const monthStr = format(currentDate, 'yyyy-MM');
  const { data: attendanceRecords, isLoading } = useAttendanceRecords(
    selectedEmployee !== 'all' ? selectedEmployee : undefined,
    monthStr
  );

  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add padding days at the start
  const startPadding = getDay(monthStart);
  const paddingDays = Array(startPadding).fill(null);

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get attendance records indexed by date and employee
  const attendanceByDateAndEmployee: Record<string, typeof attendanceRecords> = {};
  attendanceRecords?.forEach(record => {
    const key = record.work_date;
    if (!attendanceByDateAndEmployee[key]) {
      attendanceByDateAndEmployee[key] = [];
    }
    attendanceByDateAndEmployee[key]!.push(record);
  });

  // Calculate summary statistics
  const activeEmployees = employees?.filter(e => e.status === 'active') || [];
  const totalWorkDays = days.filter(d => getDay(d) !== 0 && getDay(d) !== 6).length;

  const statusCounts = attendanceRecords?.reduce((acc, record) => {
    acc[record.status] = (acc[record.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">シフト管理</h1>
            <p className="text-muted-foreground">勤怠カレンダーの確認</p>
          </div>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-lg font-semibold min-w-[160px] text-center">
                    {format(currentDate, 'yyyy年 M月', { locale: ja })}
                  </div>
                  <Button variant="outline" size="icon" onClick={goToNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" onClick={goToToday}>
                  今日
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="従業員を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全従業員</SelectItem>
                    {employees?.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>従業員数</CardDescription>
              <CardTitle className="text-2xl">{activeEmployees.length}人</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>出勤</CardDescription>
              <CardTitle className="text-2xl text-green-600">{statusCounts.present || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>リモート</CardDescription>
              <CardTitle className="text-2xl text-purple-600">{statusCounts.remote || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>有給</CardDescription>
              <CardTitle className="text-2xl text-blue-600">{statusCounts.paid_leave || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>欠勤</CardDescription>
              <CardTitle className="text-2xl text-red-600">{statusCounts.absent || 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>稼働日</CardDescription>
              <CardTitle className="text-2xl">{totalWorkDays}日</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>勤怠カレンダー</CardTitle>
            <CardDescription>
              {selectedEmployee === 'all' ? '全従業員の勤怠状況' : employees?.find(e => e.id === selectedEmployee)?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">読み込み中...</div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-7 bg-muted">
                  {weekDays.map((day, index) => (
                    <div
                      key={day}
                      className={`p-2 text-center text-sm font-medium ${
                        index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : ''
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7">
                  {/* Padding days */}
                  {paddingDays.map((_, index) => (
                    <div key={`pad-${index}`} className="border-t border-r p-2 min-h-[100px] bg-muted/50" />
                  ))}
                  {/* Actual days */}
                  {days.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const dayOfWeek = getDay(day);
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    const records = attendanceByDateAndEmployee[dateStr] || [];

                    return (
                      <div
                        key={dateStr}
                        className={`border-t border-r p-2 min-h-[100px] ${
                          isToday(day) ? 'bg-blue-50' : isWeekend ? 'bg-muted/30' : ''
                        }`}
                      >
                        <div className={`text-sm font-medium mb-1 ${
                          dayOfWeek === 0 ? 'text-red-600' : dayOfWeek === 6 ? 'text-blue-600' : ''
                        } ${isToday(day) ? 'text-blue-700' : ''}`}>
                          {format(day, 'd')}
                          {isToday(day) && <span className="ml-1 text-xs">(今日)</span>}
                        </div>
                        <div className="space-y-1">
                          {records.slice(0, 3).map(record => {
                            const config = statusConfig[record.status];
                            return (
                              <div
                                key={record.id}
                                className={`text-xs p-1 rounded truncate ${config.color}`}
                                title={`${(record as any).employee?.name}: ${config.label}${record.clock_in ? ` ${record.clock_in}` : ''}`}
                              >
                                {selectedEmployee === 'all' && (
                                  <span className="font-medium">{(record as any).employee?.name?.substring(0, 4)}</span>
                                )}
                                {' '}{config.short}
                                {record.clock_in && <span className="ml-1">{record.clock_in}</span>}
                              </div>
                            );
                          })}
                          {records.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{records.length - 3}件
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">凡例</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(statusConfig).map(([key, config]) => (
                <Badge key={key} className={config.color}>
                  {config.short} = {config.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
