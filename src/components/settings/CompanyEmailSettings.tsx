import { useState } from "react";
import { Mail, Plus, Copy, Check, Trash2, Settings2, UserPlus, HelpCircle, Receipt, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  useCompanyEmailAddresses,
  useCreateEmailAddress,
  useUpdateEmailAddress,
  useDeleteEmailAddress,
  EMAIL_PURPOSE_LABELS,
  type EmailPurpose,
  type CompanyEmailAddress,
} from "@/hooks/useCompanyEmailAddresses";
import { useCurrentCompany } from "@/hooks/useCompany";
import { toast } from "sonner";

const PurposeIcon = ({ purpose }: { purpose: EmailPurpose }) => {
  const iconClass = "h-4 w-4";
  switch (purpose) {
    case "lead_capture":
      return <UserPlus className={iconClass} />;
    case "support":
      return <HelpCircle className={iconClass} />;
    case "invoice":
      return <Receipt className={iconClass} />;
    case "contract":
      return <FileText className={iconClass} />;
    case "recruit":
      return <Users className={iconClass} />;
    default:
      return <Mail className={iconClass} />;
  }
};

export function CompanyEmailSettings() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CompanyEmailAddress | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Form state
  const [prefix, setPrefix] = useState("");
  const [purpose, setPurpose] = useState<EmailPurpose>("general");
  const [displayName, setDisplayName] = useState("");
  const [autoCreate, setAutoCreate] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);

  const { data: currentCompany } = useCurrentCompany();
  const { data: emailAddresses = [], isLoading } = useCompanyEmailAddresses();
  const createAddress = useCreateEmailAddress();
  const updateAddress = useUpdateEmailAddress();
  const deleteAddress = useDeleteEmailAddress();

  // Generate email domain based on company
  const getEmailDomain = () => {
    if (!currentCompany) return "company.totonos.jp";
    const slug = currentCompany.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    return `${slug}.totonos.jp`;
  };

  const getFullEmail = (prefix: string) => `${prefix}@${getEmailDomain()}`;

  const handleCopy = async (address: CompanyEmailAddress) => {
    const fullEmail = getFullEmail(address.address_prefix);
    await navigator.clipboard.writeText(fullEmail);
    setCopiedId(address.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("メールアドレスをコピーしました");
  };

  const handleCreate = async () => {
    if (!prefix.trim()) {
      toast.error("プレフィックスを入力してください");
      return;
    }
    
    // Validate prefix format
    if (!/^[a-z0-9-]+$/.test(prefix)) {
      toast.error("プレフィックスは半角英数字とハイフンのみ使用できます");
      return;
    }

    await createAddress.mutateAsync({
      address_prefix: prefix,
      purpose,
      display_name: displayName || undefined,
      auto_create_entity: autoCreate,
      ai_processing_enabled: aiEnabled,
    });

    resetForm();
    setShowAddDialog(false);
  };

  const handleUpdate = async () => {
    if (!editingAddress) return;

    await updateAddress.mutateAsync({
      id: editingAddress.id,
      display_name: displayName || undefined,
      auto_create_entity: autoCreate,
      ai_processing_enabled: aiEnabled,
    });

    setShowEditDialog(false);
    setEditingAddress(null);
  };

  const handleEdit = (address: CompanyEmailAddress) => {
    setEditingAddress(address);
    setPrefix(address.address_prefix);
    setPurpose(address.purpose);
    setDisplayName(address.display_name || "");
    setAutoCreate(address.auto_create_entity);
    setAiEnabled(address.ai_processing_enabled);
    setShowEditDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このメールアドレスを削除してもよろしいですか？")) return;
    await deleteAddress.mutateAsync(id);
  };

  const handleToggleActive = async (address: CompanyEmailAddress) => {
    await updateAddress.mutateAsync({
      id: address.id,
      is_active: !address.is_active,
    });
  };

  const resetForm = () => {
    setPrefix("");
    setPurpose("general");
    setDisplayName("");
    setAutoCreate(false);
    setAiEnabled(true);
  };

  const openAddDialog = () => {
    resetForm();
    setShowAddDialog(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">読み込み中...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                メールアドレス管理
              </CardTitle>
              <CardDescription>
                用途別のメールアドレスを作成し、自動処理を設定します
              </CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  アドレスを追加
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>新しいメールアドレスを追加</DialogTitle>
                  <DialogDescription>
                    用途に応じたメールアドレスを作成します
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>用途</Label>
                    <Select value={purpose} onValueChange={(v) => setPurpose(v as EmailPurpose)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(EMAIL_PURPOSE_LABELS).map(([key, { label, description }]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <PurposeIcon purpose={key as EmailPurpose} />
                              <span>{label}</span>
                              <span className="text-muted-foreground text-xs">- {description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>プレフィックス</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={prefix}
                        onChange={(e) => setPrefix(e.target.value.toLowerCase())}
                        placeholder="lead"
                        className="flex-1"
                      />
                      <span className="text-muted-foreground whitespace-nowrap">
                        @{getEmailDomain()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      半角英数字とハイフンのみ使用可能
                    </p>
                  </div>
                  <div>
                    <Label>表示名（任意）</Label>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="リード獲得用"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>自動エンティティ作成</Label>
                      <p className="text-xs text-muted-foreground">
                        受信時にリード等を自動作成
                      </p>
                    </div>
                    <Switch checked={autoCreate} onCheckedChange={setAutoCreate} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>AI分析</Label>
                      <p className="text-xs text-muted-foreground">
                        要約・分類・緊急度を自動判定
                      </p>
                    </div>
                    <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    キャンセル
                  </Button>
                  <Button onClick={handleCreate} disabled={createAddress.isPending}>
                    作成
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {emailAddresses.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                メールアドレスが登録されていません
              </p>
              <Button variant="outline" className="mt-4" onClick={openAddDialog}>
                最初のアドレスを追加
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>メールアドレス</TableHead>
                  <TableHead>用途</TableHead>
                  <TableHead>設定</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emailAddresses.map((address) => (
                  <TableRow key={address.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {getFullEmail(address.address_prefix)}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleCopy(address)}
                        >
                          {copiedId === address.id ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {address.display_name && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {address.display_name}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <PurposeIcon purpose={address.purpose} />
                        <span>{EMAIL_PURPOSE_LABELS[address.purpose].label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {address.auto_create_entity && (
                          <Badge variant="outline" className="text-xs">自動作成</Badge>
                        )}
                        {address.ai_processing_enabled && (
                          <Badge variant="outline" className="text-xs">AI分析</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={address.is_active}
                        onCheckedChange={() => handleToggleActive(address)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(address)}
                        >
                          <Settings2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(address.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Quick Setup Suggestions */}
      {emailAddresses.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">おすすめの設定</CardTitle>
            <CardDescription>よく使われるアドレス構成です</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { prefix: "lead", purpose: "lead_capture" as EmailPurpose, autoCreate: true },
                { prefix: "support", purpose: "support" as EmailPurpose, autoCreate: false },
                { prefix: "invoice", purpose: "invoice" as EmailPurpose, autoCreate: false },
                { prefix: "contract", purpose: "contract" as EmailPurpose, autoCreate: false },
                { prefix: "recruit", purpose: "recruit" as EmailPurpose, autoCreate: true },
                { prefix: "info", purpose: "general" as EmailPurpose, autoCreate: false },
              ].map((suggestion) => (
                <Card
                  key={suggestion.prefix}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={async () => {
                    await createAddress.mutateAsync({
                      address_prefix: suggestion.prefix,
                      purpose: suggestion.purpose,
                      auto_create_entity: suggestion.autoCreate,
                      ai_processing_enabled: true,
                    });
                  }}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <PurposeIcon purpose={suggestion.purpose} />
                      <span className="font-medium">
                        {EMAIL_PURPOSE_LABELS[suggestion.purpose].label}
                      </span>
                    </div>
                    <code className="text-sm text-muted-foreground">
                      {suggestion.prefix}@...
                    </code>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>メールアドレスを編集</DialogTitle>
            <DialogDescription>
              {editingAddress && getFullEmail(editingAddress.address_prefix)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>表示名</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="リード獲得用"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>自動エンティティ作成</Label>
                <p className="text-xs text-muted-foreground">
                  受信時にリード等を自動作成
                </p>
              </div>
              <Switch checked={autoCreate} onCheckedChange={setAutoCreate} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>AI分析</Label>
                <p className="text-xs text-muted-foreground">
                  要約・分類・緊急度を自動判定
                </p>
              </div>
              <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              キャンセル
            </Button>
            <Button onClick={handleUpdate} disabled={updateAddress.isPending}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
