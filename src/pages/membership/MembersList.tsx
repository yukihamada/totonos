import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, Edit, Trash2, UserCheck } from "lucide-react";
import { useMembers, useMembershipPlans } from "@/hooks/useMembership";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export default function MembersList() {
  const { members, isLoading, createMember, updateMember, deleteMember } = useMembers();
  const { plans } = useMembershipPlans();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<typeof members[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [membershipType, setMembershipType] = useState("regular");

  const handleOpenDialog = (member?: typeof members[0]) => {
    if (member) {
      setEditingMember(member);
      setName(member.name);
      setEmail(member.email || "");
      setPhone(member.phone || "");
      setGender(member.gender || "");
      setMembershipType(member.membership_type || "regular");
    } else {
      setEditingMember(null);
      setName("");
      setEmail("");
      setPhone("");
      setGender("");
      setMembershipType("regular");
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    
    if (editingMember) {
      await updateMember.mutateAsync({
        id: editingMember.id,
        name,
        email: email || null,
        phone: phone || null,
        gender: gender || null,
        membership_type: membershipType,
      });
    } else {
      await createMember.mutateAsync({
        name,
        email: email || undefined,
        phone: phone || undefined,
        gender: gender || undefined,
        membership_type: membershipType,
      });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("この会員を削除してもよろしいですか？")) {
      await deleteMember.mutateAsync(id);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateMember.mutateAsync({ id, status });
  };

  // Filter members
  const filteredMembers = members.filter((member) => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.member_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge variant="default">アクティブ</Badge>;
      case "suspended":
        return <Badge variant="secondary">休会中</Badge>;
      case "cancelled":
        return <Badge variant="destructive">退会</Badge>;
      default:
        return <Badge variant="outline">不明</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">会員一覧</h1>
            <p className="text-muted-foreground">登録会員の管理</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                新規会員
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingMember ? "会員編集" : "新規会員登録"}</DialogTitle>
                <DialogDescription>
                  会員情報を入力してください
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">氏名 *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="山田 太郎"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">電話番号</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="090-1234-5678"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">性別</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger>
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">男性</SelectItem>
                        <SelectItem value="female">女性</SelectItem>
                        <SelectItem value="other">その他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="membershipType">会員種別</Label>
                    <Select value={membershipType} onValueChange={setMembershipType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">レギュラー</SelectItem>
                        <SelectItem value="premium">プレミアム</SelectItem>
                        <SelectItem value="student">学生</SelectItem>
                        <SelectItem value="senior">シニア</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleSubmit} disabled={!name.trim()}>
                  {editingMember ? "更新" : "登録"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="名前、メール、会員番号で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="active">アクティブ</SelectItem>
                  <SelectItem value="suspended">休会中</SelectItem>
                  <SelectItem value="cancelled">退会</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Members Table */}
        <Card>
          <CardHeader>
            <CardTitle>会員一覧（{filteredMembers.length}名）</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">読み込み中...</p>
            ) : filteredMembers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {searchQuery || statusFilter !== "all" 
                  ? "該当する会員が見つかりません" 
                  : "会員がまだ登録されていません"}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>会員番号</TableHead>
                      <TableHead>氏名</TableHead>
                      <TableHead>連絡先</TableHead>
                      <TableHead>会員種別</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>入会日</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-mono">{member.member_number}</TableCell>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {member.email && <div>{member.email}</div>}
                            {member.phone && <div className="text-muted-foreground">{member.phone}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{member.membership_type || "レギュラー"}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(member.status)}</TableCell>
                        <TableCell>
                          {member.join_date && format(new Date(member.join_date), "yyyy/MM/dd", { locale: ja })}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenDialog(member)}>
                                <Edit className="h-4 w-4 mr-2" />
                                編集
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(member.id, "suspended")}>
                                <UserCheck className="h-4 w-4 mr-2" />
                                休会にする
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(member.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                削除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
