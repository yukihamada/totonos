import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  Trash2,
  Crown,
  Loader2,
  Clock,
  XCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useCurrentCompany,
  useCompanyMembers,
  useCompanyInvitations,
  useCreateInvitation,
  useRemoveMember,
  useUpdateMemberRole,
  useCancelInvitation,
} from '@/hooks/useCompany';
import type { MemberRole } from '@/types/company';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

const roleLabels: Record<MemberRole, string> = {
  owner: 'オーナー',
  admin: '管理者',
  member: 'メンバー',
  viewer: '閲覧者',
};

const roleColors: Record<MemberRole, string> = {
  owner: 'bg-amber-100 text-amber-800',
  admin: 'bg-red-100 text-red-800',
  member: 'bg-blue-100 text-blue-800',
  viewer: 'bg-gray-100 text-gray-800',
};

export default function TeamMembers() {
  const { data: companyData, isLoading: companyLoading } = useCurrentCompany();
  const company = companyData;
  const { data: members = [], isLoading: membersLoading } = useCompanyMembers(company?.id);
  const { data: invitations = [], isLoading: invitationsLoading } = useCompanyInvitations(company?.id);
  const createInvitation = useCreateInvitation();
  const removeMember = useRemoveMember();
  const updateRole = useUpdateMemberRole();
  const cancelInvitation = useCancelInvitation();

  const [search, setSearch] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<MemberRole>('member');
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<typeof members[0] | null>(null);
  const [newRole, setNewRole] = useState<MemberRole>('member');

  const isLoading = companyLoading || membersLoading || invitationsLoading;

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  const filteredMembers = members.filter(
    (m) => m.user_id?.toLowerCase().includes(search.toLowerCase())
  );

  const handleInvite = async () => {
    if (!inviteEmail || !company) {
      toast.error('メールアドレスを入力してください');
      return;
    }

    try {
      await createInvitation.mutateAsync({
        companyId: company.id,
        email: inviteEmail,
        role: inviteRole,
      });
      setInviteDialogOpen(false);
      setInviteEmail('');
      setInviteRole('member');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm('このメンバーを削除してもよろしいですか？')) return;
    
    try {
      await removeMember.mutateAsync(memberId);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleRoleChange = async () => {
    if (!selectedMember) return;
    
    try {
      await updateRole.mutateAsync({
        memberId: selectedMember.id,
        role: newRole,
      });
      setRoleDialogOpen(false);
      setSelectedMember(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await cancelInvitation.mutateAsync(invitationId);
    } catch (error) {
      // Error handled by hook
    }
  };

  const openRoleDialog = (member: typeof members[0]) => {
    setSelectedMember(member);
    setNewRole(member.role);
    setRoleDialogOpen(true);
  };

  const getInitials = (userId: string) => {
    return userId.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  if (!company) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <Users className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">会社が選択されていません</h2>
          <p className="text-muted-foreground">
            サイドバーから会社を選択してください
          </p>
        </div>
      </AppLayout>
    );
  }

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
              {members.length}人のメンバー
              {pendingInvitations.length > 0 && `、${pendingInvitations.length}人が招待中`}
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
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as MemberRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">管理者</SelectItem>
                      <SelectItem value="member">メンバー</SelectItem>
                      <SelectItem value="viewer">閲覧者</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleInvite} disabled={createInvitation.isPending}>
                  {createInvitation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
              <CardDescription>招待中</CardDescription>
              <CardTitle className="text-2xl text-yellow-600">{pendingInvitations.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>管理者数</CardDescription>
              <CardTitle className="text-2xl">
                {members.filter((m) => m.role === 'admin' || m.role === 'owner').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>一般メンバー</CardDescription>
              <CardTitle className="text-2xl">
                {members.filter((m) => m.role === 'member' || m.role === 'viewer').length}
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
                    <Badge className={roleColors[role as MemberRole]}>
                      {label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{count}人</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                招待中 ({pendingInvitations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>メールアドレス</TableHead>
                    <TableHead>役割</TableHead>
                    <TableHead>招待日</TableHead>
                    <TableHead>有効期限</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingInvitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell>{invitation.email}</TableCell>
                      <TableCell>
                        <Badge className={roleColors[invitation.role]}>
                          {roleLabels[invitation.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(invitation.created_at), 'yyyy/MM/dd', { locale: ja })}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invitation.expires_at), 'yyyy/MM/dd', { locale: ja })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleCancelInvitation(invitation.id)}
                          disabled={cancelInvitation.isPending}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Members Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>メンバー一覧</CardTitle>
              <div className="relative w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="検索..."
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
                  <TableHead>参加日</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      メンバーがいません
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback>{getInitials(member.user_id)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium flex items-center gap-1">
                              ユーザー {member.user_id.slice(0, 8)}...
                              {member.role === 'owner' && (
                                <Crown className="h-3 w-3 text-yellow-500" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {member.user_id.slice(0, 12)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleColors[member.role]}>
                          {roleLabels[member.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(member.joined_at), 'yyyy/MM/dd', { locale: ja })}
                      </TableCell>
                      <TableCell>
                        {member.role !== 'owner' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openRoleDialog(member)}>
                                <Shield className="mr-2 h-4 w-4" />
                                役割を変更
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleRemove(member.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                削除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Role Change Dialog */}
        <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>役割を変更</DialogTitle>
              <DialogDescription>
                メンバーの役割を選択してください
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Select value={newRole} onValueChange={(v) => setNewRole(v as MemberRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">管理者</SelectItem>
                  <SelectItem value="member">メンバー</SelectItem>
                  <SelectItem value="viewer">閲覧者</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleRoleChange} disabled={updateRole.isPending}>
                {updateRole.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                変更を保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
