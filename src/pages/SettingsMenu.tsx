import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Menu,
  GripVertical,
  Eye,
  EyeOff,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Save,
  Settings,
} from 'lucide-react';
import { useSettings, type MenuGroupConfig, type MenuItemConfig } from '@/hooks/useSettings';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export default function SettingsMenu() {
  const { settings, updateMenuGroup, updateMenuItem, resetToDefaults } = useSettings();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(
    settings.menuGroups.map(g => g.id)
  ));

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const handleGroupVisibilityChange = (groupId: string, visible: boolean) => {
    updateMenuGroup(groupId, { visible });
    toast.success(visible ? 'グループを表示しました' : 'グループを非表示にしました');
  };

  const handleItemVisibilityChange = (groupId: string, itemId: string, visible: boolean) => {
    updateMenuItem(groupId, itemId, { visible });
  };

  const handleReset = () => {
    resetToDefaults();
    toast.success('メニュー設定をリセットしました');
  };

  const moveGroupUp = (index: number) => {
    if (index === 0) return;
    const group = settings.menuGroups[index];
    const prevGroup = settings.menuGroups[index - 1];
    updateMenuGroup(group.id, { order: prevGroup.order });
    updateMenuGroup(prevGroup.id, { order: group.order });
  };

  const moveGroupDown = (index: number) => {
    if (index === settings.menuGroups.length - 1) return;
    const group = settings.menuGroups[index];
    const nextGroup = settings.menuGroups[index + 1];
    updateMenuGroup(group.id, { order: nextGroup.order });
    updateMenuGroup(nextGroup.id, { order: group.order });
  };

  const moveItemUp = (groupId: string, itemIndex: number, items: MenuItemConfig[]) => {
    if (itemIndex === 0) return;
    const item = items[itemIndex];
    const prevItem = items[itemIndex - 1];
    updateMenuItem(groupId, item.id, { order: prevItem.order });
    updateMenuItem(groupId, prevItem.id, { order: item.order });
  };

  const moveItemDown = (groupId: string, itemIndex: number, items: MenuItemConfig[]) => {
    if (itemIndex === items.length - 1) return;
    const item = items[itemIndex];
    const nextItem = items[itemIndex + 1];
    updateMenuItem(groupId, item.id, { order: nextItem.order });
    updateMenuItem(groupId, nextItem.id, { order: item.order });
  };

  // Sort groups and items by order
  const sortedGroups = [...settings.menuGroups].sort((a, b) => a.order - b.order);

  const visibleItemCount = settings.menuGroups.reduce(
    (acc, group) => acc + (group.visible ? group.items.filter(i => i.visible).length : 0),
    0
  );

  const totalItemCount = settings.menuGroups.reduce(
    (acc, group) => acc + group.items.length,
    0
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Menu className="h-8 w-8" />
              メニュー設定
            </h1>
            <p className="text-muted-foreground">
              サイドバーメニューの表示・非表示と並び順をカスタマイズ
            </p>
          </div>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            デフォルトに戻す
          </Button>
        </div>

        {/* 統計 */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>表示中のメニュー</CardDescription>
              <CardTitle className="text-2xl">
                {visibleItemCount} / {totalItemCount}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>表示中のグループ</CardDescription>
              <CardTitle className="text-2xl">
                {settings.menuGroups.filter(g => g.visible).length} / {settings.menuGroups.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>カスタマイズ状態</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {visibleItemCount === totalItemCount ? '全表示' : 'カスタム'}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* メニューグループ一覧 */}
        <Card>
          <CardHeader>
            <CardTitle>メニューグループ</CardTitle>
            <CardDescription>
              グループの表示/非表示を切り替え、項目を並び替えできます
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sortedGroups.map((group, groupIndex) => {
              const sortedItems = [...group.items].sort((a, b) => a.order - b.order);
              const isExpanded = expandedGroups.has(group.id);
              const visibleCount = group.items.filter(i => i.visible).length;

              return (
                <Collapsible
                  key={group.id}
                  open={isExpanded}
                  onOpenChange={() => toggleGroup(group.id)}
                >
                  <div className={`border rounded-lg ${!group.visible ? 'opacity-50' : ''}`}>
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveGroupUp(groupIndex);
                            }}
                            disabled={groupIndex === 0}
                          >
                            <ChevronDown className="h-3 w-3 rotate-180" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveGroupDown(groupIndex);
                            }}
                            disabled={groupIndex === sortedGroups.length - 1}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </div>
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 mr-2" />
                            ) : (
                              <ChevronRight className="h-4 w-4 mr-2" />
                            )}
                            <span className="font-medium">{group.label}</span>
                          </Button>
                        </CollapsibleTrigger>
                        <Badge variant="secondary">
                          {visibleCount}/{group.items.length}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {group.visible ? '表示' : '非表示'}
                        </span>
                        <Switch
                          checked={group.visible}
                          onCheckedChange={(checked) =>
                            handleGroupVisibilityChange(group.id, checked)
                          }
                        />
                      </div>
                    </div>

                    <CollapsibleContent>
                      <Separator />
                      <div className="p-4 space-y-2 bg-muted/30">
                        {sortedItems.map((item, itemIndex) => (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between p-3 bg-background rounded-md border ${
                              !item.visible ? 'opacity-50' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4"
                                  onClick={() => moveItemUp(group.id, itemIndex, sortedItems)}
                                  disabled={itemIndex === 0}
                                >
                                  <ChevronDown className="h-2 w-2 rotate-180" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4"
                                  onClick={() => moveItemDown(group.id, itemIndex, sortedItems)}
                                  disabled={itemIndex === sortedItems.length - 1}
                                >
                                  <ChevronDown className="h-2 w-2" />
                                </Button>
                              </div>
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                              <span className="text-sm">{item.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.visible ? (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              )}
                              <Switch
                                checked={item.visible}
                                onCheckedChange={(checked) =>
                                  handleItemVisibilityChange(group.id, item.id, checked)
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </CardContent>
        </Card>

        {/* ヒント */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100">
                  メニューカスタマイズのヒント
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 mt-1 space-y-1">
                  <li>・よく使うメニューを上に移動すると便利です</li>
                  <li>・使わない機能は非表示にしてスッキリ</li>
                  <li>・設定は自動保存され、次回ログイン時も維持されます</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
