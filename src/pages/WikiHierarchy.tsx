import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useWikiTree, WikiPage } from '@/hooks/useWikiTree';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  Edit,
  Copy,
  FileText,
  Clock,
  User,
  FolderTree,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

function WikiTreeItem({
  page,
  level,
  expandedIds,
  toggleExpand,
  selectedPage,
  onSelect,
  onCreateChild,
  onDelete,
}: {
  page: WikiPage;
  level: number;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  selectedPage: WikiPage | null;
  onSelect: (page: WikiPage) => void;
  onCreateChild: (parentId: string) => void;
  onDelete: (id: string) => void;
}) {
  const hasChildren = page.children && page.children.length > 0;
  const isExpanded = expandedIds.has(page.id);
  const isSelected = selectedPage?.id === page.id;

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer hover:bg-accent group',
          isSelected && 'bg-accent'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) toggleExpand(page.id);
          }}
          className="p-0.5 hover:bg-accent-foreground/10 rounded"
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )
          ) : (
            <span className="w-4" />
          )}
        </button>

        <span className="text-lg">{page.icon || '📄'}</span>

        <span
          className="flex-1 truncate text-sm"
          onClick={() => onSelect(page)}
        >
          {page.title}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onCreateChild(page.id)}>
              <Plus className="h-4 w-4 mr-2" />
              子ページを追加
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="h-4 w-4 mr-2" />
              複製
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(page.id)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {page.children!.map((child) => (
            <WikiTreeItem
              key={child.id}
              page={child}
              level={level + 1}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              selectedPage={selectedPage}
              onSelect={onSelect}
              onCreateChild={onCreateChild}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function WikiHierarchy() {
  const {
    pages,
    selectedPage,
    setSelectedPage,
    expandedIds,
    toggleExpand,
    createPage,
    updatePage,
    deletePage,
    searchPages,
  } = useWikiTree();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WikiPage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isNewPageDialogOpen, setIsNewPageDialogOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageParentId, setNewPageParentId] = useState<string | null>(null);
  const [deletePageId, setDeletePageId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      setSearchResults(searchPages(query));
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  const handleCreatePage = () => {
    if (newPageTitle.trim()) {
      const newPage = createPage(newPageParentId, newPageTitle.trim());
      setSelectedPage(newPage);
      setIsNewPageDialogOpen(false);
      setNewPageTitle('');
      setNewPageParentId(null);
    }
  };

  const handleDeletePage = () => {
    if (deletePageId) {
      deletePage(deletePageId);
      setDeletePageId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Wiki</h1>
            <p className="text-muted-foreground">
              社内ナレッジを階層構造で管理
            </p>
          </div>
          <Button onClick={() => setIsNewPageDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            新規ページ
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Tree View */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-3">
            <Card className="sticky top-6">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <FolderTree className="h-5 w-5" />
                  <CardTitle className="text-base">ページ一覧</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ページを検索..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Search Results or Tree */}
                <div className="max-h-[60vh] overflow-y-auto">
                  {isSearching ? (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground px-2 py-1">
                        {searchResults.length}件の結果
                      </p>
                      {searchResults.map((page) => (
                        <div
                          key={page.id}
                          className={cn(
                            'flex items-center gap-2 py-2 px-3 rounded-md cursor-pointer hover:bg-accent',
                            selectedPage?.id === page.id && 'bg-accent'
                          )}
                          onClick={() => {
                            setSelectedPage(page);
                            setIsSearching(false);
                            setSearchQuery('');
                          }}
                        >
                          <span>{page.icon || '📄'}</span>
                          <span className="text-sm truncate">{page.title}</span>
                        </div>
                      ))}
                      {searchResults.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          該当するページが見つかりません
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {pages.map((page) => (
                        <WikiTreeItem
                          key={page.id}
                          page={page}
                          level={0}
                          expandedIds={expandedIds}
                          toggleExpand={toggleExpand}
                          selectedPage={selectedPage}
                          onSelect={setSelectedPage}
                          onCreateChild={(parentId) => {
                            setNewPageParentId(parentId);
                            setIsNewPageDialogOpen(true);
                          }}
                          onDelete={(id) => setDeletePageId(id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Editor */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-9">
            {selectedPage ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{selectedPage.icon || '📄'}</span>
                      {isEditing ? (
                        <Input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={() => {
                            if (editingTitle.trim()) {
                              updatePage(selectedPage.id, { title: editingTitle.trim() });
                            }
                            setIsEditing(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (editingTitle.trim()) {
                                updatePage(selectedPage.id, { title: editingTitle.trim() });
                              }
                              setIsEditing(false);
                            }
                          }}
                          className="text-2xl font-bold h-auto py-1"
                          autoFocus
                        />
                      ) : (
                        <h2
                          className="text-2xl font-bold cursor-pointer hover:bg-accent px-2 py-1 rounded"
                          onClick={() => {
                            setEditingTitle(selectedPage.title);
                            setIsEditing(true);
                          }}
                        >
                          {selectedPage.title}
                        </h2>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setNewPageParentId(selectedPage.id);
                            setIsNewPageDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          子ページを追加
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          複製
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeletePageId(selectedPage.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Meta info */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {selectedPage.createdBy}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      更新: {formatDate(selectedPage.updatedAt)}
                    </div>
                    {selectedPage.parentId && (
                      <Badge variant="outline">
                        <FileText className="h-3 w-3 mr-1" />
                        子ページ
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <RichTextEditor
                    value={selectedPage.content}
                    onChange={(content) => updatePage(selectedPage.id, { content })}
                    minHeight="500px"
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-20">
                  <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">ページを選択してください</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    左のサイドバーからページを選択するか、<br />
                    新しいページを作成してください。
                  </p>
                  <Button onClick={() => setIsNewPageDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    新規ページを作成
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* New Page Dialog */}
      <Dialog open={isNewPageDialogOpen} onOpenChange={setIsNewPageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新規ページを作成</DialogTitle>
            <DialogDescription>
              {newPageParentId
                ? '選択したページの子ページとして作成します。'
                : 'ルートレベルの新しいページを作成します。'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="ページタイトル"
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreatePage();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewPageDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleCreatePage} disabled={!newPageTitle.trim()}>
              作成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletePageId} onOpenChange={() => setDeletePageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ページを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              このページと全ての子ページが削除されます。この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePage} className="bg-destructive">
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
