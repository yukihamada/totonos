import { useState } from "react";
import { Clock, Calendar, Play, Square, Users } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useEmployees, useAttendanceRecords, useClockIn, useClockOut } from "@/hooks/useHR";
import type { AttendanceStatus } from "@/types/hr";
import { LoadingWithTips } from "@/components/LoadingWithTips";

const statusLabels: Record<AttendanceStatus, string> = {
  present: '出勤',
  absent: '欠勤',
  paid_leave: '有給',
  sick_leave: '病欠',
  remote: 'リモート',
  half_day: '半休',
};

const statusColors: Record<AttendanceStatus, string> = {
  present: 'bg-green-100 text-green-800',
  absent: 'bg-red-100 text-red-800',
  paid_leave: 'bg-blue-100 text-blue-800',
  sick_leave: 'bg-orange-100 text-orange-800',
  remote: 'bg-purple-100 text-purple-800',
  half_day: 'bg-yellow-100 text-yellow-800',
};

export default function Attendance() {
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = today.slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");

  const { data: employees = [] } = useEmployees();
  const { data: records = [], isLoading } = useAttendanceRecords(
    selectedEmployee || undefined,
    selectedMonth
  );
  const clockIn = useClockIn();
  const clockOut = useClockOut();

  const handleClockIn = (employeeId: string) => {
    clockIn.mutate({ employeeId, date: today });
  };

  const handleClockOut = (employeeId: string) => {
    clockOut.mutate({ employeeId, date: today });
  };

  // Summary stats
  const totalWorkHours = records.reduce((sum, r) => sum + (r.work_hours || 0), 0);
  const totalOvertimeHours = records.reduce((sum, r) => sum + (r.overtime_hours || 0), 0);
  const presentDays = records.filter(r => r.status === 'present' || r.status === 'remote').length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">勤怠管理</h1>
            <p className="text-muted-foreground">出退勤記録・勤務時間管理</p>
          </div>
        </div>

        {/* Quick Clock In/Out */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              今日の打刻 - {today}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map(emp => {
                const todayRecord = records.find(r => 
                  r.employee_id === emp.id && r.work_date === today
                );
                return (
                  <div key={emp.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{emp.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {todayRecord?.clock_in ? `出勤: ${todayRecord.clock_in}` : '未出勤'}
                        {todayRecord?.clock_out && ` - 退勤: ${todayRecord.clock_out}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!todayRecord?.clock_in ? (
                        <Button 
                          size="sm" 
                          onClick={() => handleClockIn(emp.id)}
                          disabled={clockIn.isPending}
                        >
                          <Play className="h-4 w-4 mr-1" />出勤
                        </Button>
                      ) : !todayRecord?.clock_out ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleClockOut(emp.id)}
                          disabled={clockOut.isPending}
                        >
                          <Square className="h-4 w-4 mr-1" />退勤
                        </Button>
                      ) : (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          完了
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
              {employees.length === 0 && (
                <p className="text-muted-foreground col-span-full text-center py-4">
                  従業員を登録してください
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{presentDays}日</p>
                  <p className="text-sm text-muted-foreground">出勤日数</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{totalWorkHours.toFixed(1)}h</p>
                  <p className="text-sm text-muted-foreground">総労働時間</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Clock className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{totalOvertimeHours.toFixed(1)}h</p>
                  <p className="text-sm text-muted-foreground">残業時間</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="月を選択" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const value = date.toISOString().slice(0, 7);
                return (
                  <SelectItem key={value} value={value}>
                    {date.getFullYear()}年{date.getMonth() + 1}月
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="全従業員" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全従業員</SelectItem>
              {employees.map(emp => (
                <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Records Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日付</TableHead>
                <TableHead>従業員</TableHead>
                <TableHead>出勤</TableHead>
                <TableHead>退勤</TableHead>
                <TableHead>労働時間</TableHead>
                <TableHead>残業</TableHead>
                <TableHead>ステータス</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7}><LoadingWithTips module="attendance" columns={7} rows={5} showTip={false} /></TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">勤怠記録がありません</p>
                  </TableCell>
                </TableRow>
              ) : records.map(record => (
                <TableRow key={record.id}>
                  <TableCell>{record.work_date}</TableCell>
                  <TableCell className="font-medium">
                    {(record.employee as any)?.name || '-'}
                  </TableCell>
                  <TableCell>{record.clock_in || '-'}</TableCell>
                  <TableCell>{record.clock_out || '-'}</TableCell>
                  <TableCell>{record.work_hours?.toFixed(1) || 0}h</TableCell>
                  <TableCell>{record.overtime_hours?.toFixed(1) || 0}h</TableCell>
                  <TableCell>
                    <Badge className={statusColors[record.status]}>
                      {statusLabels[record.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
