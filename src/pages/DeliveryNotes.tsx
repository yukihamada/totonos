import { useState } from "react";
import { FileText, Upload, Eye, PackageCheck, AlertCircle, Search } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeliveryNotes } from "@/hooks/useDeliveryNotes";
import { DeliveryNoteUpload } from "@/components/inventory/DeliveryNoteUpload";
import { DeliveryNoteReview } from "@/components/inventory/DeliveryNoteReview";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

const STATUS_CONFIG = {
  pending: { label: "処理中", variant: "secondary" as const },
  processing: { label: "OCR中", variant: "secondary" as const },
  review: { label: "確認待ち", variant: "outline" as const },
  confirmed: { label: "確認済み", variant: "default" as const },
  applied: { label: "在庫反映済み", variant: "default" as const },
};

export default function DeliveryNotes() {
  const { deliveryNotes, isLoading, deleteDeliveryNote } = useDeliveryNotes();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredNotes = deliveryNotes.filter(note => {
    const matchesSearch = !searchQuery || 
      note.delivery_note_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.supplier_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || note.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = deliveryNotes.filter(n => n.status === 'review').length;
  const appliedCount = deliveryNotes.filter(n => n.status === 'applied').length;

  const handleUploadSuccess = (deliveryNoteId: string) => {
    setShowUploadDialog(false);
    setSelectedNoteId(deliveryNoteId);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              納品書管理
            </h1>
            <p className="text-muted-foreground">
              納品書をOCRで読み取り、在庫に自動反映
            </p>
          </div>
          <Button onClick={() => setShowUploadDialog(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            納品書をアップロード
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">確認待ち</p>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">在庫反映済み</p>
                  <p className="text-2xl font-bold">{appliedCount}</p>
                </div>
                <PackageCheck className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">総納品書数</p>
                  <p className="text-2xl font-bold">{deliveryNotes.length}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="納品書番号・仕入先で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="all">すべて</TabsTrigger>
              <TabsTrigger value="review">確認待ち</TabsTrigger>
              <TabsTrigger value="applied">反映済み</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* List */}
        <Card>
          <CardHeader>
            <CardTitle>納品書一覧</CardTitle>
            <CardDescription>
              {filteredNotes.length}件の納品書
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                読み込み中...
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery || statusFilter !== "all" 
                  ? "該当する納品書がありません" 
                  : "納品書がありません。アップロードして始めましょう。"
                }
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>納品書番号</TableHead>
                    <TableHead>仕入先</TableHead>
                    <TableHead>納品日</TableHead>
                    <TableHead>商品数</TableHead>
                    <TableHead className="text-right">合計金額</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotes.map((note) => {
                    const status = STATUS_CONFIG[note.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                    return (
                      <TableRow key={note.id}>
                        <TableCell className="font-mono">
                          {note.delivery_note_number || '-'}
                        </TableCell>
                        <TableCell>
                          {note.supplier_name || '不明'}
                        </TableCell>
                        <TableCell>
                          {note.delivery_date 
                            ? format(new Date(note.delivery_date), 'yyyy/MM/dd', { locale: ja })
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          {note.items?.length || 0}件
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ¥{note.total_amount?.toLocaleString() ?? '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedNoteId(note.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {note.status !== 'applied' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteDeliveryNote.mutate(note.id)}
                              >
                                削除
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>納品書アップロード</DialogTitle>
          </DialogHeader>
          <DeliveryNoteUpload onSuccess={handleUploadSuccess} />
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={!!selectedNoteId} onOpenChange={(open) => !open && setSelectedNoteId(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>納品書確認</DialogTitle>
          </DialogHeader>
          {selectedNoteId && (
            <DeliveryNoteReview 
              deliveryNoteId={selectedNoteId} 
              onComplete={() => setSelectedNoteId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
