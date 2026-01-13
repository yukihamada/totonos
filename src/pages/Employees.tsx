import { useState } from "react";
import { Plus, Search, Users, MoreHorizontal, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmployees, useCreateEmployee, useDeleteEmployee } from "@/hooks/useHR";
import type { EmploymentType } from "@/types/hr";

const employmentTypeLabels: Record<EmploymentType, string> = {
  full_time: '正社員',
  part_time: 'パート',
  contract: '契約社員',
  intern: 'インターン',
};

export default function Employees() {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_number: "",
    name: "",
    email: "",
    department: "",
    position: "",
    hire_date: new Date().toISOString().split('T')[0],
    employment_type: "full_time" as EmploymentType,
    base_salary: 0,
    status: "active" as const,
  });

  const { data: employees = [], isLoading } = useEmployees();
  const createEmployee = useCreateEmployee();
  const deleteEmployee = useDeleteEmployee();

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.employee_number.toLowerCase().includes(search.toLowerCase()) ||
    e.department?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createEmployee.mutateAsync(formData);
    setIsDialogOpen(false);
    setFormData({
      employee_number: "",
      name: "",
      email: "",
      department: "",
      position: "",
      hire_date: new Date().toISOString().split('T')[0],
      employment_type: "full_time",
      base_salary: 0,
      status: "active" as const,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">従業員管理</h1>
            <p className="text-muted-foreground">従業員情報の管理</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />従業員を追加</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新規従業員登録</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>社員番号</Label>
                    <Input
                      value={formData.employee_number}
                      onChange={e => setFormData(f => ({ ...f, employee_number: e.target.value }))}
                      placeholder="EMP-0001"
                      required
                    />
                  </div>
                  <div>
                    <Label>氏名</Label>
                    <Input
                      value={formData.name}
                      onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>メール</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>部署</Label>
                    <Input
                      value={formData.department}
                      onChange={e => setFormData(f => ({ ...f, department: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>役職</Label>
                    <Input
                      value={formData.position}
                      onChange={e => setFormData(f => ({ ...f, position: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>入社日</Label>
                    <Input
                      type="date"
                      value={formData.hire_date}
                      onChange={e => setFormData(f => ({ ...f, hire_date: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label>雇用形態</Label>
                    <Select
                      value={formData.employment_type}
                      onValueChange={v => setFormData(f => ({ ...f, employment_type: v as EmploymentType }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">正社員</SelectItem>
                        <SelectItem value="part_time">パート</SelectItem>
                        <SelectItem value="contract">契約社員</SelectItem>
                        <SelectItem value="intern">インターン</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={createEmployee.isPending}>
                  {createEmployee.isPending ? "登録中..." : "登録"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="検索..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>社員番号</TableHead>
                <TableHead>氏名</TableHead>
                <TableHead>部署</TableHead>
                <TableHead>役職</TableHead>
                <TableHead>雇用形態</TableHead>
                <TableHead>入社日</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">読み込み中...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">従業員がいません</p>
                  </TableCell>
                </TableRow>
              ) : filtered.map(emp => (
                <TableRow key={emp.id}>
                  <TableCell className="font-mono">{emp.employee_number}</TableCell>
                  <TableCell className="font-medium">{emp.name}</TableCell>
                  <TableCell>{emp.department || "-"}</TableCell>
                  <TableCell>{emp.position || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{employmentTypeLabels[emp.employment_type]}</Badge>
                  </TableCell>
                  <TableCell>{emp.hire_date}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            if (confirm("削除しますか？")) deleteEmployee.mutate(emp.id);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
