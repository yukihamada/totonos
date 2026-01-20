import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Shield, Wand2, Settings2 } from 'lucide-react';
import {
  useMemberPermissions,
  useSetMemberPermissions,
  rolePermissions,
  permissionCategories,
  permissionActionLabels,
} from '@/hooks/useMemberPermissions';
import type { Permission } from '@/hooks/usePermissions';
import type { MemberRole } from '@/types/company';

interface MemberPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  memberName: string;
  currentRole: MemberRole;
}

const roleLabels: Record<string, string> = {
  owner: 'オーナー',
  admin: '管理者',
  manager: 'マネージャー',
  member: 'メンバー',
  viewer: '閲覧者',
};

export function MemberPermissionsDialog({
  open,
  onOpenChange,
  memberId,
  memberName,
  currentRole,
}: MemberPermissionsDialogProps) {
  const { data: existingPermissions = [], isLoading } = useMemberPermissions(memberId);
  const setPermissions = useSetMemberPermissions();
  
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  const [selectedPreset, setSelectedPreset] = useState<string>(currentRole);
  const [customPermissions, setCustomPermissions] = useState<Permission[]>([]);

  // Initialize state when dialog opens or permissions load
  useEffect(() => {
    if (open && !isLoading) {
      if (existingPermissions.length > 0) {
        // Check if existing permissions match a preset
        const matchingPreset = Object.entries(rolePermissions).find(
          ([, perms]) => 
            perms.length === existingPermissions.length &&
            perms.every(p => existingPermissions.includes(p))
        );
        
        if (matchingPreset) {
          setMode('preset');
          setSelectedPreset(matchingPreset[0]);
        } else {
          setMode('custom');
          setCustomPermissions(existingPermissions);
        }
      } else {
        // Use role's default permissions
        setMode('preset');
        setSelectedPreset(currentRole);
        setCustomPermissions(rolePermissions[currentRole] || []);
      }
    }
  }, [open, existingPermissions, isLoading, currentRole]);

  // Update custom permissions when switching to custom mode
  useEffect(() => {
    if (mode === 'custom' && customPermissions.length === 0) {
      setCustomPermissions(rolePermissions[selectedPreset] || []);
    }
  }, [mode, selectedPreset, customPermissions.length]);

  const togglePermission = (permission: Permission) => {
    setCustomPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSave = async () => {
    const permissions = mode === 'preset' 
      ? rolePermissions[selectedPreset] || []
      : customPermissions;

    await setPermissions.mutateAsync({ memberId, permissions });
    onOpenChange(false);
  };

  const getPermissionLabel = (permission: string) => {
    const [module, action] = permission.split(':');
    const actionLabel = permissionActionLabels[action] || action;
    return actionLabel;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            権限設定: {memberName}
          </DialogTitle>
          <DialogDescription>
            プリセットから選択するか、個別に権限を設定できます
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <RadioGroup
              value={mode}
              onValueChange={(v) => setMode(v as 'preset' | 'custom')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="preset" id="preset" />
                <Label htmlFor="preset" className="flex items-center gap-2 cursor-pointer">
                  <Wand2 className="h-4 w-4" />
                  プリセットを使用
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="flex items-center gap-2 cursor-pointer">
                  <Settings2 className="h-4 w-4" />
                  カスタム権限
                </Label>
              </div>
            </RadioGroup>

            <Separator />

            {mode === 'preset' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>役割プリセット</Label>
                  <Select value={selectedPreset} onValueChange={setSelectedPreset}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleLabels).map(([role, label]) => (
                        <SelectItem key={role} value={role}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">含まれる権限:</h4>
                  <div className="flex flex-wrap gap-2">
                    {(rolePermissions[selectedPreset] || []).map((perm) => (
                      <Badge key={perm} variant="secondary" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {permissionCategories.map((category) => (
                    <div key={category.id} className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        {category.label}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {category.permissions.map((perm) => (
                          <div
                            key={perm}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={perm}
                              checked={customPermissions.includes(perm as Permission)}
                              onCheckedChange={() => togglePermission(perm as Permission)}
                            />
                            <Label
                              htmlFor={perm}
                              className="text-sm cursor-pointer"
                            >
                              {getPermissionLabel(perm)}
                              <span className="text-muted-foreground ml-1">
                                ({perm.split(':')[0]})
                              </span>
                            </Label>
                          </div>
                        ))}
                      </div>
                      <Separator />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={setPermissions.isPending}>
            {setPermissions.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            権限を保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
