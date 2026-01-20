import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Menu,
  GripVertical,
  Eye,
  EyeOff,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Settings,
  Smartphone,
  LayoutDashboard,
  Briefcase,
  ShoppingCart,
  Users,
  Factory,
  Code,
  Calculator,
  Check,
  ArrowUp,
  ArrowDown,
  LucideIcon,
  Scale,
  Palette,
  Warehouse,
  Utensils,
  Scissors,
  HardHat,
  Globe,
  Stethoscope,
  Heart,
  GraduationCap,
  HeartHandshake,
  Truck,
  Building,
  Rocket,
  User,
  Download,
} from 'lucide-react';
import { HpkiBridgeDownload } from '@/components/emr/HpkiBridgeDownload';
import { useAppSettings } from '@/contexts/SettingsContext';
import { type MenuItemConfig } from '@/hooks/useSettings';
import { industryTemplates, availableMobileNavItems } from '@/types/menu-templates';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// Icon mapping for templates
const templateIconMap: Record<string, LucideIcon> = {
  Briefcase,
  ShoppingCart,
  Users,
  Factory,
  Code,
  Calculator,
  Scale,
  Palette,
  Warehouse,
  Utensils,
  Scissors,
  HardHat,
  Globe,
  Stethoscope,
  Heart,
  GraduationCap,
  HeartHandshake,
  Truck,
  Building,
  Rocket,
  User,
};

export default function SettingsMenu() {
  const { 
    settings, 
    updateMenuGroup, 
    updateMenuItem, 
    resetToDefaults,
    updateMobileNavItems,
    applyTemplate 
  } = useAppSettings();
  
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(
    settings.menuGroups.map(g => g.id)
  ));
  const [activeTab, setActiveTab] = useState("menu");

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

  // Mobile nav handlers
  const handleMobileNavToggle = (itemId: string, visible: boolean) => {
    const existingItem = settings.mobileNavItems.find(i => i.id === itemId);
    
    if (existingItem) {
      const updated = settings.mobileNavItems.map(item =>
        item.id === itemId ? { ...item, visible } : item
      );
      updateMobileNavItems(updated);
    } else {
      const maxOrder = Math.max(...settings.mobileNavItems.map(i => i.order), -1);
      updateMobileNavItems([
        ...settings.mobileNavItems,
        { id: itemId, visible, order: maxOrder + 1 }
      ]);
    }
  };

  const handleMobileNavMove = (itemId: string, direction: 'up' | 'down') => {
    const items = [...settings.mobileNavItems].sort((a, b) => a.order - b.order);
    const currentIndex = items.findIndex(i => i.id === itemId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const updated = items.map((item, index) => {
      if (index === currentIndex) return { ...item, order: newIndex };
      if (index === newIndex) return { ...item, order: currentIndex };
      return item;
    });

    updateMobileNavItems(updated);
  };

  const handleApplyTemplate = (templateId: string) => {
    applyTemplate(templateId);
    toast.success("テンプレートを適用しました");
  };

  // Sort groups and items by order
  const sortedGroups = [...settings.menuGroups].sort((a, b) => a.order - b.order);
  const sortedMobileNav = [...settings.mobileNavItems].sort((a, b) => a.order - b.order);

  const visibleItemCount = settings.menuGroups.reduce(
    (acc, group) => acc + (group.visible ? group.items.filter(i => i.visible).length : 0),
    0
  );

  const totalItemCount = settings.menuGroups.reduce(
    (acc, group) => acc + group.items.length,
    0
  );

  const visibleMobileCount = settings.mobileNavItems.filter(i => i.visible).length;

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
              サイドバーとモバイルナビゲーションをカスタマイズ
            </p>
          </div>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            デフォルトに戻す
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="menu">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              サイドバー
            </TabsTrigger>
            <TabsTrigger value="mobile">
              <Smartphone className="h-4 w-4 mr-2" />
              モバイル
            </TabsTrigger>
            <TabsTrigger value="templates">
              <Briefcase className="h-4 w-4 mr-2" />
              テンプレート
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="space-y-4">
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
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4 pr-4">
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
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* EMR HPKI Bridge Download Section - shown when EMR group is visible */}
            {settings.menuGroups.find(g => g.id === 'emr')?.visible && (
              <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-green-600" />
                    <CardTitle>電子カルテ用アプリ</CardTitle>
                  </div>
                  <CardDescription>
                    HPKI電子署名機能を使用するには、ローカルブリッジアプリのインストールが必要です。
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <HpkiBridgeDownload showTitle={false} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="mobile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>モバイルフッターナビゲーション</CardTitle>
                <CardDescription>
                  モバイル画面下部に表示するメニューを選択（最大3つ + チャット + メニュー）
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Badge variant={visibleMobileCount > 3 ? "destructive" : "secondary"}>
                    選択中: {visibleMobileCount}/3
                  </Badge>
                  {visibleMobileCount > 3 && (
                    <p className="text-sm text-destructive mt-2">
                      ※ 最大3つまで表示されます。4つ以上選択した場合、上位3つのみ表示されます。
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  {availableMobileNavItems.map((navItem) => {
                    const existingItem = settings.mobileNavItems.find(i => i.id === navItem.id);
                    const isVisible = existingItem?.visible ?? false;
                    const visibleItems = sortedMobileNav.filter(i => i.visible);
                    const visibleIndex = visibleItems.findIndex(i => i.id === navItem.id);

                    return (
                      <div 
                        key={navItem.id}
                        className={`flex items-center justify-between py-3 px-4 rounded-lg border ${isVisible ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={isVisible}
                            onCheckedChange={(checked) => handleMobileNavToggle(navItem.id, checked)}
                          />
                          <span className={isVisible ? "font-medium" : "text-muted-foreground"}>
                            {navItem.label}
                          </span>
                          {isVisible && visibleIndex >= 0 && visibleIndex < 3 && (
                            <Badge variant="outline">{visibleIndex + 1}番目</Badge>
                          )}
                          {isVisible && visibleIndex >= 3 && (
                            <Badge variant="secondary">非表示（4番目以降）</Badge>
                          )}
                        </div>
                        {isVisible && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMobileNavMove(navItem.id, 'up')}
                              disabled={visibleIndex === 0}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMobileNavMove(navItem.id, 'down')}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>業界別テンプレート</CardTitle>
                <CardDescription>
                  業界に最適化されたメニュー構成を一括で適用できます
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {industryTemplates.map((template) => {
                    const Icon = templateIconMap[template.icon] || Briefcase;
                    const isActive = settings.currentTemplateId === template.id;

                    return (
                      <Card 
                        key={template.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${isActive ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => handleApplyTemplate(template.id)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <CardTitle className="text-lg">{template.name}</CardTitle>
                            </div>
                            {isActive && (
                              <Badge variant="default">
                                <Check className="h-3 w-3 mr-1" />
                                適用中
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground mb-3">
                            {template.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {template.menuGroups.slice(0, 4).map((group) => (
                              <Badge key={group.id} variant="outline" className="text-xs">
                                {group.label}
                              </Badge>
                            ))}
                            {template.menuGroups.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{template.menuGroups.length - 4}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ヒント */}
        <Card className="bg-accent/50 border-accent">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent rounded-full">
                <Settings className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-medium">
                  メニューカスタマイズのヒント
                </h3>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li>・よく使うメニューを上に移動すると便利です</li>
                  <li>・使わない機能は非表示にしてスッキリ</li>
                  <li>・業界テンプレートで最適なメニュー構成を素早く適用</li>
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
