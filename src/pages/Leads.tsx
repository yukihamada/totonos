import { useState } from "react";
import { Plus, Search, UserPlus, MoreHorizontal, Trash2, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLeads, useCreateLead, useDeleteLead, useUpdateLead } from "@/hooks/useCRM";
import { leadStatusLabels, sourceLabels } from "@/types/crm";
import type { LeadSource, LeadStatus } from "@/types/crm";
import { LoadingWithTips } from "@/components/LoadingWithTips";

const statusColors: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-green-100 text-green-800',
  converted: 'bg-purple-100 text-purple-800',
  lost: 'bg-red-100 text-red-800',
};

export default function Leads() {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    source: "website" as LeadSource,
    status: "new" as LeadStatus,
    notes: "",
  });

  const { data: leads = [], isLoading } = useLeads();
  const createLead = useCreateLead();
  const deleteLead = useDeleteLead();
  const updateLead = useUpdateLead();

  const filtered = leads.filter(l =>
    l.company_name.toLowerCase().includes(search.toLowerCase()) ||
    l.contact_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createLead.mutateAsync(formData);
    setIsDialogOpen(false);
    setFormData({ company_name: "", contact_name: "", email: "", phone: "", source: "website", status: "new", notes: "" });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">リード管理</h1>
            <p className="text-muted-foreground">見込み客の管理</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />リードを追加</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>新規リード登録</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>会社名 *</Label>
                  <Input value={formData.company_name} onChange={e => setFormData(f => ({ ...f, company_name: e.target.value }))} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>担当者名</Label><Input value={formData.contact_name} onChange={e => setFormData(f => ({ ...f, contact_name: e.target.value }))} /></div>
                  <div><Label>メール</Label><Input type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>電話</Label><Input value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} /></div>
                  <div>
                    <Label>流入元</Label>
                    <Select value={formData.source} onValueChange={v => setFormData(f => ({ ...f, source: v as LeadSource }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(sourceLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>メモ</Label><Textarea value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} /></div>
                <Button type="submit" className="w-full" disabled={createLead.isPending}>{createLead.isPending ? "登録中..." : "登録"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="検索..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>会社名</TableHead>
                <TableHead>担当者</TableHead>
                <TableHead>流入元</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>登録日</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6}><LoadingWithTips module="leads" columns={6} rows={5} showTip={false} /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">
                  <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">リードがありません</p>
                </TableCell></TableRow>
              ) : filtered.map(lead => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.company_name}</TableCell>
                  <TableCell>{lead.contact_name || "-"}</TableCell>
                  <TableCell><Badge variant="outline">{sourceLabels[lead.source]}</Badge></TableCell>
                  <TableCell><Badge className={statusColors[lead.status]}>{leadStatusLabels[lead.status]}</Badge></TableCell>
                  <TableCell>{new Date(lead.created_at).toLocaleDateString('ja-JP')}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateLead.mutate({ id: lead.id, status: 'contacted' })}><ArrowRight className="mr-2 h-4 w-4" />連絡済みに</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateLead.mutate({ id: lead.id, status: 'qualified' })}><ArrowRight className="mr-2 h-4 w-4" />見込み確定に</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => { if (confirm("削除しますか？")) deleteLead.mutate(lead.id); }}><Trash2 className="mr-2 h-4 w-4" />削除</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
