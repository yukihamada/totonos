import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Users,
  UserPlus,
  Search,
  Mail,
  MoreHorizontal,
  Shield,
  Eye,
  Edit,
  Trash2,
  Crown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'accountant' | 'sales' | 'hr' | 'viewer';
  department: string;
  status: 'active' | 'pending' | 'inactive';
  joinedAt: Date;
  lastActive?: Date;
}

const roleLabels: Record<TeamMember['role'], string> = {
  admin: '管理者',
  manager: 'マネージャー',
  accountant: '経理',
  sales: '営業',
  hr: '人事',
  viewer: '閲覧者',
};

const roleColors: Record<TeamMember['role'], string> = {
  admin: 'bg-red-100 text-red-800',
  manager: 'bg-purple-100 text-purple-800',
  accountant: 'bg-green-100 text-green-800',
  sales: 'bg-blue-100 text-blue-800',
  hr: 'bg-orange-100 text-orange-800',
  viewer: 'bg-gray-100 text-gray-800',
};

const mockMembers: TeamMember[] = [
  {
    id: '1',
    name: '山田 太郎',
    email: 'yamada@example.com',
    role: 'admin',
    department: '経営企画',
    status: 'active',
    joinedAt: new Date('2024-01-15'),
    lastActive: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: '2',
    name: '佐藤 花子',
    email: 'sato@example.com',
    role: 'accountant',
    department: '経理部',
    status: 'active',
    joinedAt: new Date('2024-03-01'),
    lastActive: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '3',
    name: '鈴木 一郎',
    email: 'suzuki@example.com',
    role: 'sales',
    department: '営業部',
    status: 'active',
    joinedAt: new Date('2024-06-15'),
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '4',
    name: '田中 美咲',
    email: 'tanaka@example.com',
    role: 'hr',
    department: '人事部',
    status: 'active',
    joinedAt: new Date('2024-08-01'),
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: '5',
    name: '高橋 健太',
    email: 'takahashi@example.com',
    role: 'viewer',
    department: '開発部',
    status: 'pending',
    joinedAt: new Date('2025-01-10'),
  },
  {
    id: '6',
    name: '伊藤 恵',
    email: 'ito@example.com',
    role: 'manager',
    department: '営業部',
    status: 'inactive',
    joinedAt: new Date('2023-11-20'),
    lastActive: new Date('2024-12-15'),
  },
];

export default function TeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>(mockMembers);
  const [search, setSearch] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('viewer');

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.department.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = members.filter((m) => m.status === 'active').length;
  const pendingCount = members.filter((m) => m.status === 'pending').length;

  const handleInvite = () => {
    if (!inviteEmail) {
      toast.error('メールアドレスを入力してください');
      return;
    }
    toast.success(`${inviteEmail}に招待を送信しました`);
    setInviteDialogOpen(false);
    setInviteEmail('');
    setInviteRole('viewer');
  };

  const handleRemove = (member: TeamMember) => {
    setMembers((prev) => prev.filter((m) => m.id !== member.id));
    toast.success(`${member.name}をチームから削除しました`);
  };

  const handleChangeRole = (member: TeamMember, newRole: TeamMember['role']) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === member.id ? { ...m, role: newRole } : m))
    );
    toast.success(`${member.name}の役割を${roleLabels[newRole]}に変更しました`);
  };

  const getStatusBadge = (status: TeamMember['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">アクティブ</Badge>;
      case 'pending':
        return <Badge variant="secondary">招待中</Badge>;
      case 'inactive':
        return <Badge variant="outline">非アクティブ</Badge>;
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.slice(0, 2);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-8 w-8" />
              チームメンバー
            </h1>
            <p className="text-muted-foreground">
              {activeCount}人のアクティブメンバー
              {pendingCount > 0 && `、${pendingCount}人が招待中`}
            </p>
          </div>
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                メンバーを招待
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>チームメンバーを招待</DialogTitle>
                <DialogDescription>
                  招待メールを送信して新しいメンバーを追加
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>メールアドレス</Label>
                  <Input
                    type="email"
                    placeholder="member@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>役割</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as TeamMember['role'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">管理者</SelectItem>
                      <SelectItem value="manager">マネージャー</SelectItem>
                      <SelectItem value="accountant">経理</SelectItem>
                      <SelectItem value="sales">営業</SelectItem>
                      <SelectItem value="hr">人事</SelectItem>
                      <SelectItem value="viewer">閲覧者</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleInvite}>
                  <Mail className="mr-2 h-4 w-4" />
                  招待を送信
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>総メンバー数</CardDescription>
              <CardTitle className="text-2xl">{members.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>アクティブ</CardDescription>
              <CardTitle className="text-2xl text-green-600">{activeCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>招待中</CardDescription>
              <CardTitle className="text-2xl text-yellow-600">{pendingCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>管理者数</CardDescription>
              <CardTitle className="text-2xl">
                {members.filter((m) => m.role === 'admin').length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Role Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              役割別メンバー
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {Object.entries(roleLabels).map(([role, label]) => {
                const count = members.filter((m) => m.role === role).length;
                return (
                  <div key={role} className="flex items-center gap-2">
                    <Badge className={roleColors[role as TeamMember['role']]}>
                      {label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{count}人</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Members Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>メンバー一覧</CardTitle>
              <div className="relative w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="名前、メール、部署で検索..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>メンバー</TableHead>
                  <TableHead>役割</TableHead>
                  <TableHead>部署</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>参加日</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium flex items-center gap-1">
                            {member.name}
                            {member.role === 'admin' && (
                              <Crown className="h-3 w-3 text-yellow-500" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={roleColors[member.role]}>
                        {roleLabels[member.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>{member.department}</TableCell>
                    <TableCell>{getStatusBadge(member.status)}</TableCell>
                    <TableCell>
                      {member.joinedAt.toLocaleDateString('ja-JP')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            詳細を見る
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            役割を変更
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleRemove(member)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            削除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
