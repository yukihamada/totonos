import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  Calculator,
  Wallet,
  FileSpreadsheet,
  Cloud,
  Target,
  Users,
  UserCheck,
  Database,
  BookOpen,
  MessageSquare,
  Calendar,
  Mail,
  HardDrive,
  Plug,
} from "lucide-react";
import {
  useExternalServiceTypes,
  useExternalConnections,
  useCreateConnection,
  useUpdateConnection,
  useDeleteConnection,
  useTestConnection,
  useSyncConnection,
} from "@/hooks/useExternalConnections";
import type { 
  ExternalServiceType, 
  ExternalConnection, 
  ServiceCategory,
  ConnectionStatus 
} from "@/types/integration";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/types/integration";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

// Icon mapping for services
const SERVICE_ICONS: Record<string, React.ElementType> = {
  freee: Calculator,
  moneyforward: Wallet,
  yayoi: FileSpreadsheet,
  salesforce: Cloud,
  hubspot: Target,
  zoho: Users,
  smarthr: UserCheck,
  freee_hr: Users,
  kintone: Database,
  notion: BookOpen,
  slack: MessageSquare,
  google_calendar: Calendar,
  outlook: Mail,
  google_drive: HardDrive,
  dropbox: Cloud,
};

const STATUS_ICONS: Record<ConnectionStatus, React.ElementType> = {
  active: CheckCircle2,
  pending: Clock,
  error: XCircle,
  expired: AlertTriangle,
};

const STATUS_COLORS: Record<ConnectionStatus, string> = {
  active: 'text-green-600 dark:text-green-400',
  pending: 'text-yellow-600 dark:text-yellow-400',
  error: 'text-red-600 dark:text-red-400',
  expired: 'text-orange-600 dark:text-orange-400',
};

export default function Integrations() {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ExternalServiceType | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<ExternalConnection | null>(null);
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});
  
  // Form state
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [displayName, setDisplayName] = useState('');
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [syncInterval, setSyncInterval] = useState('60');

  const { data: serviceTypes, isLoading: loadingServices } = useExternalServiceTypes();
  const { data: connections, isLoading: loadingConnections } = useExternalConnections();
  const createConnection = useCreateConnection();
  const updateConnection = useUpdateConnection();
  const deleteConnection = useDeleteConnection();
  const testConnection = useTestConnection();
  const syncConnection = useSyncConnection();

  // Filter services by category
  const filteredServices = useMemo(() => {
    if (!serviceTypes) return [];
    if (selectedCategory === 'all') return serviceTypes;
    return serviceTypes.filter(s => s.category === selectedCategory);
  }, [serviceTypes, selectedCategory]);

  // Group connections by service
  const connectionsByService = useMemo(() => {
    const map = new Map<string, ExternalConnection>();
    connections?.forEach(conn => {
      map.set(conn.service_type, conn);
    });
    return map;
  }, [connections]);

  // Get unique categories
  const categories = useMemo(() => {
    if (!serviceTypes) return [];
    const cats = [...new Set(serviceTypes.map(s => s.category))];
    return cats.sort();
  }, [serviceTypes]);

  const handleOpenAddDialog = (service: ExternalServiceType) => {
    setSelectedService(service);
    setCredentials({});
    setDisplayName('');
    setSyncEnabled(true);
    setSyncInterval('60');
    setIsAddDialogOpen(true);
  };

  const handleOpenSettings = (connection: ExternalConnection) => {
    setSelectedConnection(connection);
    setDisplayName(connection.display_name || '');
    setSyncEnabled(connection.settings.sync_enabled ?? true);
    setSyncInterval(String(connection.settings.sync_interval || 60));
    setIsSettingsDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!selectedService) return;
    
    await createConnection.mutateAsync({
      service_type: selectedService.id,
      display_name: displayName || undefined,
      credentials,
      settings: {
        sync_enabled: syncEnabled,
        sync_interval: parseInt(syncInterval),
      },
    });
    
    setIsAddDialogOpen(false);
  };

  const handleUpdateSettings = async () => {
    if (!selectedConnection) return;
    
    await updateConnection.mutateAsync({
      id: selectedConnection.id,
      display_name: displayName || null,
      settings: {
        ...selectedConnection.settings,
        sync_enabled: syncEnabled,
        sync_interval: parseInt(syncInterval),
      },
    });
    
    setIsSettingsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedConnection) return;
    
    await deleteConnection.mutateAsync(selectedConnection.id);
    setIsDeleteDialogOpen(false);
    setSelectedConnection(null);
  };

  const handleTest = (connectionId: string) => {
    testConnection.mutate(connectionId);
  };

  const handleSync = (connectionId: string) => {
    syncConnection.mutate(connectionId);
  };

  const getCredentialFields = (service: ExternalServiceType) => {
    switch (service.auth_type) {
      case 'api_key':
        return [{ key: 'api_key', label: 'APIキー', type: 'password' }];
      case 'api_token':
        return [
          { key: 'api_token', label: 'APIトークン', type: 'password' },
          ...(service.config.requires_subdomain 
            ? [{ key: 'subdomain', label: 'サブドメイン', type: 'text' }]
            : []),
        ];
      case 'oauth2':
        return [
          { key: 'client_id', label: 'クライアントID', type: 'text' },
          { key: 'client_secret', label: 'クライアントシークレット', type: 'password' },
        ];
      default:
        return [{ key: 'api_key', label: 'APIキー', type: 'password' }];
    }
  };

  const renderServiceCard = (service: ExternalServiceType) => {
    const Icon = SERVICE_ICONS[service.id] || Plug;
    const connection = connectionsByService.get(service.id);
    const isConnected = !!connection;
    const StatusIcon = connection ? STATUS_ICONS[connection.status] : null;

    return (
      <Card key={service.id} className="relative">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-base">{service.name}</CardTitle>
                <CardDescription className="text-xs">
                  {CATEGORY_LABELS[service.category as ServiceCategory]}
                </CardDescription>
              </div>
            </div>
            {isConnected && StatusIcon && (
              <StatusIcon className={`h-5 w-5 ${STATUS_COLORS[connection.status]}`} />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">ステータス</span>
                <Badge variant={connection.status === 'active' ? 'default' : 'secondary'}>
                  {STATUS_LABELS[connection.status]}
                </Badge>
              </div>
              {connection.last_sync_at && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">最終同期</span>
                  <span className="text-xs">
                    {format(new Date(connection.last_sync_at), 'MM/dd HH:mm', { locale: ja })}
                  </span>
                </div>
              )}
              {connection.last_error && (
                <p className="text-xs text-destructive truncate" title={connection.last_error}>
                  {connection.last_error}
                </p>
              )}
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleTest(connection.id)}
                  disabled={testConnection.isPending}
                >
                  {testConnection.isPending ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    'テスト'
                  )}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleSync(connection.id)}
                  disabled={syncConnection.isPending || connection.status !== 'active'}
                >
                  {syncConnection.isPending ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    '同期'
                  )}
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleOpenSettings(connection)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              className="w-full" 
              onClick={() => handleOpenAddDialog(service)}
            >
              <Plus className="h-4 w-4 mr-2" />
              接続する
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">外部サービス連携</h1>
          <p className="text-muted-foreground">
            他のSaaSサービスと連携して、データのインポートやAIエージェントからのアクセスを可能にします。
          </p>
        </div>

        {/* Connected Services Summary */}
        {connections && connections.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">接続中のサービス</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {connections.map(conn => {
                  const Icon = SERVICE_ICONS[conn.service_type] || Plug;
                  const StatusIcon = STATUS_ICONS[conn.status];
                  return (
                    <div 
                      key={conn.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {conn.display_name || conn.service?.name || conn.service_type}
                      </span>
                      <StatusIcon className={`h-4 w-4 ${STATUS_COLORS[conn.status]}`} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as ServiceCategory | 'all')}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">すべて</TabsTrigger>
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat}>
                {CATEGORY_LABELS[cat as ServiceCategory] || cat}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-0">
            {loadingServices || loadingConnections ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-9 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredServices.map(renderServiceCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Add Connection Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedService && (
                  <>
                    {(() => {
                      const Icon = SERVICE_ICONS[selectedService.id] || Plug;
                      return <Icon className="h-5 w-5" />;
                    })()}
                    {selectedService.name}に接続
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                APIキーや認証情報を入力して接続を設定します。
              </DialogDescription>
            </DialogHeader>

            {selectedService && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name">表示名（任意）</Label>
                  <Input
                    id="display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={`例: 本番環境の${selectedService.name}`}
                  />
                </div>

                {getCredentialFields(selectedService).map(field => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <div className="relative">
                      <Input
                        id={field.key}
                        type={showCredentials[field.key] ? 'text' : field.type}
                        value={credentials[field.key] || ''}
                        onChange={(e) => setCredentials({ ...credentials, [field.key]: e.target.value })}
                        placeholder={`${field.label}を入力`}
                      />
                      {field.type === 'password' && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                          onClick={() => setShowCredentials({ 
                            ...showCredentials, 
                            [field.key]: !showCredentials[field.key] 
                          })}
                        >
                          {showCredentials[field.key] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-2">
                  <Label htmlFor="sync-enabled">自動同期を有効にする</Label>
                  <Switch
                    id="sync-enabled"
                    checked={syncEnabled}
                    onCheckedChange={setSyncEnabled}
                  />
                </div>

                {syncEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="sync-interval">同期間隔</Label>
                    <Select value={syncInterval} onValueChange={setSyncInterval}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15分ごと</SelectItem>
                        <SelectItem value="30">30分ごと</SelectItem>
                        <SelectItem value="60">1時間ごと</SelectItem>
                        <SelectItem value="180">3時間ごと</SelectItem>
                        <SelectItem value="360">6時間ごと</SelectItem>
                        <SelectItem value="720">12時間ごと</SelectItem>
                        <SelectItem value="1440">24時間ごと</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                キャンセル
              </Button>
              <Button 
                onClick={handleCreate}
                disabled={createConnection.isPending || Object.keys(credentials).length === 0}
              >
                {createConnection.isPending ? '接続中...' : '接続する'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>接続設定</DialogTitle>
              <DialogDescription>
                {selectedConnection?.display_name || selectedConnection?.service?.name}の設定を変更します。
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-display-name">表示名</Label>
                <Input
                  id="edit-display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="表示名を入力"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="edit-sync-enabled">自動同期を有効にする</Label>
                <Switch
                  id="edit-sync-enabled"
                  checked={syncEnabled}
                  onCheckedChange={setSyncEnabled}
                />
              </div>

              {syncEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="edit-sync-interval">同期間隔</Label>
                  <Select value={syncInterval} onValueChange={setSyncInterval}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15分ごと</SelectItem>
                      <SelectItem value="30">30分ごと</SelectItem>
                      <SelectItem value="60">1時間ごと</SelectItem>
                      <SelectItem value="180">3時間ごと</SelectItem>
                      <SelectItem value="360">6時間ごと</SelectItem>
                      <SelectItem value="720">12時間ごと</SelectItem>
                      <SelectItem value="1440">24時間ごと</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    setIsSettingsDialogOpen(false);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  この接続を削除
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
                キャンセル
              </Button>
              <Button 
                onClick={handleUpdateSettings}
                disabled={updateConnection.isPending}
              >
                {updateConnection.isPending ? '保存中...' : '保存'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>接続を削除しますか？</AlertDialogTitle>
              <AlertDialogDescription>
                この操作は取り消せません。接続情報とすべての設定が削除されます。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                削除する
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
