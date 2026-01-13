import { useState } from "react";
import { Plus, Book, FileText, Search, Trash2, Eye } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useWikiPages, useCreateWikiPage, useDeleteWikiPage } from "@/hooks/useWiki";
import { categoryLabels } from "@/types/wiki";
import type { WikiCategory } from "@/types/wiki";

export default function Wiki() {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "other" as WikiCategory,
    is_published: true,
  });

  const { data: pages = [], isLoading } = useWikiPages();
  const createPage = useCreateWikiPage();
  const deletePage = useDeleteWikiPage();

  const filtered = pages.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.content?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPage.mutateAsync(formData);
    setIsDialogOpen(false);
    setFormData({ title: "", content: "", category: "other", is_published: true });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">社内Wiki</h1>
            <p className="text-muted-foreground">社内ドキュメント・ナレッジ管理</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />ページを作成</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>新規ページ作成</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>タイトル *</Label><Input value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} required /></div>
                  <div>
                    <Label>カテゴリ</Label>
                    <Select value={formData.category} onValueChange={v => setFormData(f => ({ ...f, category: v as WikiCategory }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>内容（Markdown対応）</Label>
                  <Textarea
                    value={formData.content}
                    onChange={e => setFormData(f => ({ ...f, content: e.target.value }))}
                    rows={10}
                    placeholder="# 見出し&#10;&#10;本文を入力..."
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createPage.isPending}>
                  {createPage.isPending ? "作成中..." : "作成"}
                </Button>
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

        {isLoading ? (
          <div className="text-center py-8">読み込み中...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Book className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">ページがありません</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(page => (
              <Card key={page.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {page.title}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => { if (confirm("削除しますか？")) deletePage.mutate(page.id); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Badge variant="outline">{categoryLabels[page.category]}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {page.content?.slice(0, 150) || "内容なし"}
                  </p>
                  <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{page.view_count}</span>
                    <span>{new Date(page.updated_at).toLocaleDateString('ja-JP')}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
