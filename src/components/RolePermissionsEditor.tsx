import { useState } from 'react';
import {
  PERMISSION_MODULES,
  PERMISSION_ACTIONS,
  PermissionModule,
  PermissionAction,
  Permission,
  MODULE_LABELS,
  ACTION_LABELS,
  DEFAULT_ROLES,
  RolePermissions,
  getModulePermissions,
} from '@/types/permissions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock } from 'lucide-react';

interface RolePermissionsEditorProps {
  onRoleChange?: (roleId: string, permissions: Permission[]) => void;
}

export function RolePermissionsEditor({ onRoleChange }: RolePermissionsEditorProps) {
  const [selectedRole, setSelectedRole] = useState<string>('member');
  const role = DEFAULT_ROLES.find((r) => r.id === selectedRole) || DEFAULT_ROLES[3];

  const handlePermissionToggle = (module: PermissionModule, action: PermissionAction) => {
    if (role.isSystem) return; // Cannot edit system roles
    
    const permission: Permission = `${module}:${action}`;
    const newPermissions = role.permissions.includes(permission)
      ? role.permissions.filter((p) => p !== permission)
      : [...role.permissions, permission];
    
    onRoleChange?.(selectedRole, newPermissions);
  };

  const hasPermission = (module: PermissionModule, action: PermissionAction) => {
    return role.permissions.includes(`${module}:${action}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          ロール権限管理
        </CardTitle>
        <CardDescription>
          各ロールのアクセス権限を管理します
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="ロールを選択" />
            </SelectTrigger>
            <SelectContent>
              {DEFAULT_ROLES.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  <div className="flex items-center gap-2">
                    {r.name}
                    {r.isSystem && <Lock className="h-3 w-3 text-muted-foreground" />}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div>
            <Badge variant="outline">{role.description}</Badge>
          </div>
        </div>

        {role.isSystem && (
          <p className="text-sm text-muted-foreground">
            <Lock className="inline h-3 w-3 mr-1" />
            システムロールは編集できません
          </p>
        )}

        <div className="border rounded-lg overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background">モジュール</TableHead>
                {PERMISSION_ACTIONS.map((action) => (
                  <TableHead key={action} className="text-center">
                    {ACTION_LABELS[action]}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {PERMISSION_MODULES.map((module) => (
                <TableRow key={module}>
                  <TableCell className="sticky left-0 bg-background font-medium">
                    {MODULE_LABELS[module]}
                  </TableCell>
                  {PERMISSION_ACTIONS.map((action) => (
                    <TableCell key={action} className="text-center">
                      <Checkbox
                        checked={hasPermission(module, action)}
                        onCheckedChange={() => handlePermissionToggle(module, action)}
                        disabled={role.isSystem}
                        aria-label={`${MODULE_LABELS[module]}の${ACTION_LABELS[action]}権限`}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>権限の説明:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>閲覧</strong>: データの閲覧が可能</li>
            <li><strong>作成</strong>: 新規データの作成が可能</li>
            <li><strong>編集</strong>: 既存データの編集が可能</li>
            <li><strong>削除</strong>: データの削除が可能</li>
            <li><strong>エクスポート</strong>: データのエクスポートが可能</li>
            <li><strong>承認</strong>: 承認フローでの承認が可能</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
