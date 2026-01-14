import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEmployees, useAttendanceRecords } from '@/hooks/useHR';
import { Plus, Calendar, Clock, User } from 'lucide-react';
import { format, differenceInDays, parseISO, addDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import type { Database } from '@/integrations/supabase/types';

type AttendanceStatus = Database['public']['Enums']['attendance_status'];

const leaveTypes: { value: AttendanceStatus; label: string; color: string }[] = [
  { value: 'paid_leave', label: '有給休暇', color: 'bg-blue-100 text-blue-800' },
  { value: 'sick_leave', label: '病気休暇', color: 'bg-orange-100 text-orange-800' },
  { value: 'half_day', label: '半休', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'absent', label: '欠勤', color: 'bg-red-100 text-red-800' },
];

export default function LeaveRequests() {
  const queryClient = useQueryClient();
  const { data: employees } = useEmployees();
  const { data: attendanceRecords, isLoading } = useAttendanceRecords();

  const [isOpen, setIsOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [leaveType, setLeaveType] = useState<AttendanceStatus>('paid_leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter leave records only
  const leaveRecords = attendanceRecords?.filter(
    r => r.status === 'paid_leave' || r.status === 'sick_leave' || r.status === 'half_day' || r.status === 'absent'
  ) || [];

  // Calculate statistics
  const currentYear = new Date().getFullYear();
  const thisYearRecords = leaveRecords.filter(r => r.work_date.startsWith(currentYear.toString()));

  const paidLeaveCount = thisYearRecords.filter(r => r.status === 'paid_leave').length;
  const sickLeaveCount = thisYearRecords.filter(r => r.status === 'sick_leave').length;
  const halfDayCount = thisYearRecords.filter(r => r.status === 'half_day').length;
  const absentCount = thisYearRecords.filter(r => r.status === 'absent').length;

  const handleSubmit = async () => {
    if (!employeeId || !startDate) return;

    setIsSubmitting(true);
    try {
      const end = endDate || startDate;
      const start = parseISO(startDate);
      const endParsed = parseISO(end);
      const dayCount = differenceInDays(endParsed, start) + 1;

      // Create records for each day
      const records = [];
      for (let i = 0; i < dayCount; i++) {
        const date = addDays(start, i);
        records.push({
          employee_id: employeeId,
          work_date: format(date, 'yyyy-MM-dd'),
          status: leaveType,
          note: note || null,
        });
      }

      const { error } = await supabase
        .from('attendance_records')
        .upsert(records, { onConflict: 'employee_id,work_date' });

      if (error) throw error;

      toast.success(`休暇を${dayCount}日分登録しました`);
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      setIsOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error('休暇の登録に失敗しました: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmployeeId('');
    setLeaveType('paid_leave');
    setStartDate('');
    setEndDate('');
    setNote('');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">休暇管理</h1>
            <p className="text-muted-foreground">休暇申請と取得状況の管理</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                休暇を登録
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>休暇を登録</DialogTitle>
                <DialogDescription>従業員の休暇を登録します</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>従業員 *</Label>
                  <Select value={employeeId} onValueChange={setEmployeeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="従業員を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees?.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.employee_number} - {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>休暇種別 *</Label>
                  <Select value={leaveType} onValueChange={(v) => setLeaveType(v as AttendanceStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>開始日 *</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>終了日</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                    />
                    <p className="text-xs text-muted-foreground">1日のみの場合は空欄</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>備考</Label>
                  <Textarea
                    placeholder="休暇理由など"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting || !employeeId || !startDate}>
                  {isSubmitting ? '登録中...' : '登録'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>有給取得</CardDescription>
              <CardTitle className="text-2xl text-blue-600">{paidLeaveCount}日</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{currentYear}年</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>病欠</CardDescription>
              <CardTitle className="text-2xl text-orange-600">{sickLeaveCount}日</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{currentYear}年</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>半休</CardDescription>
              <CardTitle className="text-2xl text-yellow-600">{halfDayCount}日</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{currentYear}年</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>欠勤</CardDescription>
              <CardTitle className="text-2xl text-red-600">{absentCount}日</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{currentYear}年</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>合計休暇</CardDescription>
              <CardTitle className="text-2xl">{thisYearRecords.length}日</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{currentYear}年累計</p>
            </CardContent>
          </Card>
        </div>

        {/* Leave Records List */}
        <Card>
          <CardHeader>
            <CardTitle>休暇履歴</CardTitle>
            <CardDescription>直近の休暇取得記録</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">読み込み中...</div>
            ) : leaveRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                休暇記録がありません
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>従業員</TableHead>
                    <TableHead>日付</TableHead>
                    <TableHead>種別</TableHead>
                    <TableHead>備考</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveRecords.map(record => {
                    const typeConfig = leaveTypes.find(t => t.value === record.status);
                    return (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {(record as any).employee?.name || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(record.work_date), 'yyyy/MM/dd (E)', { locale: ja })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={typeConfig?.color || ''}>
                            {typeConfig?.label || record.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {record.note || '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Employee Leave Summary */}
        <Card>
          <CardHeader>
            <CardTitle>従業員別休暇取得状況</CardTitle>
            <CardDescription>{currentYear}年の休暇取得日数</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>従業員番号</TableHead>
                  <TableHead>氏名</TableHead>
                  <TableHead className="text-right">有給</TableHead>
                  <TableHead className="text-right">病欠</TableHead>
                  <TableHead className="text-right">半休</TableHead>
                  <TableHead className="text-right">欠勤</TableHead>
                  <TableHead className="text-right">合計</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees?.map(emp => {
                  const empRecords = thisYearRecords.filter(r => r.employee_id === emp.id);
                  const paid = empRecords.filter(r => r.status === 'paid_leave').length;
                  const sick = empRecords.filter(r => r.status === 'sick_leave').length;
                  const half = empRecords.filter(r => r.status === 'half_day').length;
                  const absent = empRecords.filter(r => r.status === 'absent').length;
                  const total = empRecords.length;

                  return (
                    <TableRow key={emp.id}>
                      <TableCell className="font-mono">{emp.employee_number}</TableCell>
                      <TableCell>{emp.name}</TableCell>
                      <TableCell className="text-right text-blue-600">{paid || '-'}</TableCell>
                      <TableCell className="text-right text-orange-600">{sick || '-'}</TableCell>
                      <TableCell className="text-right text-yellow-600">{half || '-'}</TableCell>
                      <TableCell className="text-right text-red-600">{absent || '-'}</TableCell>
                      <TableCell className="text-right font-medium">{total || '-'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
