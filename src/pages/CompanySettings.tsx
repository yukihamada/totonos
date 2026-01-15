import { useState, useEffect } from "react";
import { Building2, Plus, Users, Settings, CreditCard, Mail, Trash2, Shield } from "lucide-react";
import { CompanyEmailSettings } from "@/components/settings/CompanyEmailSettings";
import { DeleteCompanyDialog } from "@/components/DeleteCompanyDialog";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  useCurrentCompany,
  useUserCompanies,
  useCreateCompany,
  useUpdateCompany,
  useSwitchCompany,
  useCompanyMembers,
  useCompanyInvitations,
  useCreateInvitation,
  useUpdateMemberRole,
  useRemoveMember,
  useCancelInvitation,
  useUpdateMemberPermissions,
  useDeleteCompany,
} from "@/hooks/useCompany";
import { useHybridCredits, PLANS, CHARGE_PACKS } from "@/hooks/useCreditsV2";
import {
  PERMISSION_GROUPS,
  PERMISSION_LABELS,
  ROLE_LABELS,
  type MemberRole,
  type PermissionType,
} from "@/types/company";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function CompanySettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("company");
  const [showNewCompanyDialog, setShowNewCompanyDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionType[]>([]);

  // New company form
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyDisplayName, setNewCompanyDisplayName] = useState("");

  // Company edit form
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<MemberRole>("member");

  const { data: currentCompany, isLoading: companyLoading } = useCurrentCompany();
  const { data: userCompanies = [] } = useUserCompanies();
  const { data: members = [] } = useCompanyMembers(currentCompany?.id);
  const { data: invitations = [] } = useCompanyInvitations(currentCompany?.id);
  const { companyRemaining, userRemaining, totalRemaining } = useHybridCredits();

  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const switchCompany = useSwitchCompany();
  const createInvitation = useCreateInvitation();
  const updateMemberRole = useUpdateMemberRole();
  const updateMemberPermissions = useUpdateMemberPermissions();
  const removeMember = useRemoveMember();
  const cancelInvitation = useCancelInvitation();
  const deleteCompany = useDeleteCompany();

  // Check if current user is owner
  const currentMembership = userCompanies.find(
    (m: any) => m.company_id === currentCompany?.id
  );
  const isOwner = currentMembership?.role === "owner";

  // Update edit form when currentCompany changes
  useEffect(() => {
    if (currentCompany) {
      setEditCompanyName(currentCompany.name || "");
      setEditDisplayName(currentCompany.display_name || "");
      setEditEmail(currentCompany.email || "");
      setEditPhone(currentCompany.phone || "");
      setEditAddress(currentCompany.address || "");
    }
  }, [currentCompany]);

  const handleUpdateCompany = async () => {
    if (!currentCompany) return;
    
    if (!editCompanyName.trim()) {
      toast.error("会社名を入力してください");
      return;
    }

    await updateCompany.mutateAsync({
      id: currentCompany.id,
      name: editCompanyName.trim(),
      display_name: editDisplayName.trim() || null,
      email: editEmail.trim() || null,
      phone: editPhone.trim() || null,
      address: editAddress.trim() || null,
    });
  };

  const handleCreateCompany = async () => {
    if (!newCompanyName.trim()) {
      toast.error("会社名を入力してください");
      return;
    }

    await createCompany.mutateAsync({
      name: newCompanyName,
      display_name: newCompanyDisplayName || newCompanyName,
    });

    setNewCompanyName("");
    setNewCompanyDisplayName("");
    setShowNewCompanyDialog(false);
  };

  const handleInvite = async () => {
    if (!currentCompany || !inviteEmail.trim()) {
      toast.error("メールアドレスを入力してください");
      return;
    }

    await createInvitation.mutateAsync({
      companyId: currentCompany.id,
      email: inviteEmail,
      role: inviteRole,
    });

    setInviteEmail("");
    setInviteRole("member");
    setShowInviteDialog(false);
  };

  const handleOpenPermissions = (memberId: string, currentPermissions: PermissionType[]) => {
    setSelectedMemberId(memberId);
    setSelectedPermissions(currentPermissions);
    setShowPermissionDialog(true);
  };

  const handleSavePermissions = async () => {
    if (!selectedMemberId) return;

    await updateMemberPermissions.mutateAsync({
      memberId: selectedMemberId,
      permissions: selectedPermissions,
    });

    setShowPermissionDialog(false);
    setSelectedMemberId(null);
  };

  const togglePermission = (permission: PermissionType) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleDeleteCompany = async () => {
    if (!currentCompany) return;
    await deleteCompany.mutateAsync(currentCompany.id);
    // Navigate to dashboard or settings after deletion
    navigate("/dashboard");
  };

  if (companyLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">会社・チーム管理</h1>
            <p className="text-muted-foreground">
              会社の登録・切替、チームメンバーの招待と権限管理
            </p>
          </div>
          <Dialog open={showNewCompanyDialog} onOpenChange={setShowNewCompanyDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新しい会社を登録
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新しい会社を登録</DialogTitle>
                <DialogDescription>
                  複数の会社を登録して、切り替えて使用できます
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="company-name">会社名 *</Label>
                  <Input
                    id="company-name"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    placeholder="例: 株式会社サンプル"
                  />
                </div>
                <div>
                  <Label htmlFor="display-name">表示名</Label>
                  <Input
                    id="display-name"
                    value={newCompanyDisplayName}
                    onChange={(e) => setNewCompanyDisplayName(e.target.value)}
                    placeholder="例: サンプル社"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowNewCompanyDialog(false)}
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleCreateCompany}
                  disabled={createCompany.isPending}
                >
                  登録
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Company Switcher */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              現在の会社
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {userCompanies.map((membership: any) => (
                <Button
                  key={membership.company_id}
                  variant={currentCompany?.id === membership.company_id ? "default" : "outline"}
                  onClick={() => switchCompany.mutate(membership.company_id)}
                  disabled={switchCompany.isPending}
                >
                  {membership.companies?.display_name || membership.companies?.name}
                  <Badge variant="secondary" className="ml-2">
                    {ROLE_LABELS[membership.role as MemberRole]}
                  </Badge>
                </Button>
              ))}
              {userCompanies.length === 0 && (
                <p className="text-muted-foreground">
                  会社が登録されていません。新しい会社を登録してください。
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {currentCompany && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="company">
                <Settings className="h-4 w-4 mr-2" />
                会社情報
              </TabsTrigger>
              <TabsTrigger value="members">
                <Users className="h-4 w-4 mr-2" />
                メンバー
              </TabsTrigger>
              <TabsTrigger value="invitations">招待</TabsTrigger>
              <TabsTrigger value="email">
                <Mail className="h-4 w-4 mr-2" />
                メール
              </TabsTrigger>
              <TabsTrigger value="credits">
                <CreditCard className="h-4 w-4 mr-2" />
                クレジット
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="h-4 w-4 mr-2" />
                セキュリティ
              </TabsTrigger>
            </TabsList>

            <TabsContent value="company" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>会社情報</CardTitle>
                  <CardDescription>会社の基本情報を編集します</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>会社名</Label>
                      <Input 
                        value={editCompanyName} 
                        onChange={(e) => setEditCompanyName(e.target.value)}
                        placeholder="株式会社サンプル"
                      />
                    </div>
                    <div>
                      <Label>表示名</Label>
                      <Input 
                        value={editDisplayName} 
                        onChange={(e) => setEditDisplayName(e.target.value)}
                        placeholder="サンプル社"
                      />
                    </div>
                    <div>
                      <Label>メールアドレス</Label>
                      <Input
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="info@example.com"
                      />
                    </div>
                    <div>
                      <Label>電話番号</Label>
                      <Input
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="03-1234-5678"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>住所</Label>
                      <Input
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="東京都渋谷区..."
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleUpdateCompany}
                    disabled={updateCompany.isPending}
                  >
                    {updateCompany.isPending ? "保存中..." : "保存"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email" className="space-y-4 mt-4">
              <CompanyEmailSettings />
            </TabsContent>

            <TabsContent value="members" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>チームメンバー</CardTitle>
                      <CardDescription>
                        メンバーの役割と権限を管理します
                      </CardDescription>
                    </div>
                    <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          メンバーを招待
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>メンバーを招待</DialogTitle>
                          <DialogDescription>
                            メールアドレスで招待を送信します
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>メールアドレス</Label>
                            <Input
                              type="email"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              placeholder="user@example.com"
                            />
                          </div>
                          <div>
                            <Label>役割</Label>
                            <Select
                              value={inviteRole}
                              onValueChange={(v) => setInviteRole(v as MemberRole)}
                            >
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
                          <Button
                            variant="outline"
                            onClick={() => setShowInviteDialog(false)}
                          >
                            キャンセル
                          </Button>
                          <Button
                            onClick={handleInvite}
                            disabled={createInvitation.isPending}
                          >
                            招待を送信
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ユーザー</TableHead>
                        <TableHead>役割</TableHead>
                        <TableHead>権限</TableHead>
                        <TableHead>参加日</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>{member.user_id.slice(0, 8)}...</TableCell>
                          <TableCell>
                            <Select
                              value={member.role}
                              onValueChange={(v) =>
                                updateMemberRole.mutate({
                                  memberId: member.id,
                                  role: v as MemberRole,
                                })
                              }
                              disabled={member.role === "owner"}
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="owner" disabled>
                                  オーナー
                                </SelectItem>
                                <SelectItem value="admin">管理者</SelectItem>
                                <SelectItem value="member">メンバー</SelectItem>
                                <SelectItem value="viewer">閲覧者</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleOpenPermissions(
                                  member.id,
                                  member.permissions?.map((p) => p.permission) || []
                                )
                              }
                            >
                              {member.permissions?.length || 0}個の権限
                            </Button>
                          </TableCell>
                          <TableCell>
                            {new Date(member.joined_at).toLocaleDateString("ja-JP")}
                          </TableCell>
                          <TableCell>
                            {member.role !== "owner" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => removeMember.mutate(member.id)}
                              >
                                削除
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {members.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">
                              まだメンバーがいません
                            </p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Permission Dialog */}
              <Dialog
                open={showPermissionDialog}
                onOpenChange={setShowPermissionDialog}
              >
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>権限設定</DialogTitle>
                    <DialogDescription>
                      このメンバーのアクセス権限を設定します
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    {Object.entries(PERMISSION_GROUPS).map(([key, group]) => (
                      <div key={key} className="space-y-2">
                        <h4 className="font-medium">{group.label}</h4>
                        <div className="flex flex-wrap gap-2">
                          {group.permissions.map((permission) => (
                            <label
                              key={permission}
                              className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted"
                            >
                              <Checkbox
                                checked={selectedPermissions.includes(permission)}
                                onCheckedChange={() => togglePermission(permission)}
                              />
                              <span className="text-sm">
                                {PERMISSION_LABELS[permission]}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowPermissionDialog(false)}
                    >
                      キャンセル
                    </Button>
                    <Button
                      onClick={handleSavePermissions}
                      disabled={updateMemberPermissions.isPending}
                    >
                      保存
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="invitations" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>招待一覧</CardTitle>
                  <CardDescription>保留中の招待を確認・管理します</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>メールアドレス</TableHead>
                        <TableHead>役割</TableHead>
                        <TableHead>ステータス</TableHead>
                        <TableHead>有効期限</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitations.map((invitation) => (
                        <TableRow key={invitation.id}>
                          <TableCell>{invitation.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {ROLE_LABELS[invitation.role]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                invitation.status === "pending"
                                  ? "secondary"
                                  : invitation.status === "accepted"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {invitation.status === "pending"
                                ? "保留中"
                                : invitation.status === "accepted"
                                ? "承諾済み"
                                : "期限切れ"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(invitation.expires_at).toLocaleDateString("ja-JP")}
                          </TableCell>
                          <TableCell>
                            {invitation.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => cancelInvitation.mutate(invitation.id)}
                              >
                                キャンセル
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {invitations.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <p className="text-muted-foreground">
                              招待はありません
                            </p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="credits" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <CreditCard className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{totalRemaining}</p>
                        <p className="text-sm text-muted-foreground">合計クレジット</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-bold">{companyRemaining}</p>
                        <p className="text-sm text-muted-foreground">会社クレジット</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-bold">{userRemaining}</p>
                        <p className="text-sm text-muted-foreground">個人クレジット</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>クレジット購入</CardTitle>
                  <CardDescription>
                    会社のクレジットプールに追加します（Stripe決済）
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {CHARGE_PACKS.map((pack) => (
                      <Card
                        key={pack.id}
                        className="cursor-pointer hover:border-primary transition-colors"
                      >
                        <CardContent className="pt-6 text-center">
                          <p className="text-3xl font-bold">{pack.credits}</p>
                          <p className="text-muted-foreground">クレジット</p>
                          <p className="text-lg font-medium mt-2">
                            ¥{pack.price.toLocaleString()}
                          </p>
                          {pack.discount > 0 && (
                            <Badge variant="secondary" className="mt-2">
                              {pack.discount}% OFF
                            </Badge>
                          )}
                          <Button className="w-full mt-4">購入</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    セキュリティ設定
                  </CardTitle>
                  <CardDescription>
                    会社のセキュリティと危険な操作を管理します
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">アクセスログ</h4>
                    <p className="text-sm text-muted-foreground">
                      最近のログイン履歴やアクセスログを確認できます（近日公開予定）
                    </p>
                  </div>
                </CardContent>
              </Card>

              {isOwner && (
                <Card className="border-destructive">
                  <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                      <Trash2 className="h-5 w-5" />
                      危険な操作
                    </CardTitle>
                    <CardDescription>
                      これらの操作は取り消すことができません。十分ご注意ください。
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                      <div className="space-y-1">
                        <p className="font-medium">会社を完全に削除</p>
                        <p className="text-sm text-muted-foreground">
                          この会社に関連するすべてのデータ（請求書、契約書、顧客情報、従業員データなど）が完全に削除されます。この操作は取り消せません。
                        </p>
                      </div>
                      <Button 
                        variant="destructive"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        会社を削除
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Delete Company Dialog */}
        {currentCompany && (
          <DeleteCompanyDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            companyName={currentCompany.name}
            onConfirm={handleDeleteCompany}
            isLoading={deleteCompany.isPending}
          />
        )}
      </div>
    </AppLayout>
  );
}
