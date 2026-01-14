import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Mail,
  Inbox,
  Star,
  Archive,
  Trash2,
  Search,
  Loader2,
  Paperclip,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  useInboundEmails,
  useMarkEmailAsRead,
  useToggleEmailStar,
  useArchiveEmail,
  useMarkAsSpam,
  type InboundEmail,
} from '@/hooks/useInboundEmails';
import { cn } from '@/lib/utils';

export default function InboundEmails() {
  const [search, setSearch] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<InboundEmail | null>(null);
  const [activeTab, setActiveTab] = useState('inbox');

  const { data: emails = [], isLoading, refetch } = useInboundEmails({
    status: activeTab === 'archived' ? 'archived' : undefined,
  });

  const markAsRead = useMarkEmailAsRead();
  const toggleStar = useToggleEmailStar();
  const archiveEmail = useArchiveEmail();
  const markAsSpam = useMarkAsSpam();

  const filteredEmails = emails.filter(email => {
    if (activeTab === 'starred' && !email.is_starred) return false;
    if (activeTab === 'spam' && !email.is_spam) return false;
    if (activeTab === 'inbox' && (email.is_spam || email.status === 'archived')) return false;

    if (search) {
      const searchLower = search.toLowerCase();
      return (
        email.from_email.toLowerCase().includes(searchLower) ||
        (email.from_name?.toLowerCase().includes(searchLower)) ||
        (email.subject?.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  const handleEmailClick = (email: InboundEmail) => {
    setSelectedEmail(email);
    if (!email.is_read) {
      markAsRead.mutate({ id: email.id, isRead: true });
    }
  };

  const unreadCount = emails.filter(e => !e.is_read && !e.is_spam && e.status !== 'archived').length;
  const starredCount = emails.filter(e => e.is_starred).length;
  const spamCount = emails.filter(e => e.is_spam).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Mail className="h-8 w-8" />
              受信メール
            </h1>
            <p className="text-muted-foreground">
              totonos.jp 宛のメールを管理
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            更新
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="メールを検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="inbox" className="flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              受信トレイ
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="starred" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              スター付き
              {starredCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {starredCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="spam" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              スパム
              {spamCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {spamCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              アーカイブ
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredEmails.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">メールがありません</p>
                  <p className="text-sm text-muted-foreground">
                    {activeTab === 'inbox' && '新しいメールが届くとここに表示されます'}
                    {activeTab === 'starred' && 'スター付きのメールがありません'}
                    {activeTab === 'spam' && 'スパムメールはありません'}
                    {activeTab === 'archived' && 'アーカイブしたメールはありません'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {filteredEmails.map((email) => (
                      <div
                        key={email.id}
                        className={cn(
                          "flex items-start gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors",
                          !email.is_read && "bg-primary/5"
                        )}
                        onClick={() => handleEmailClick(email)}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar.mutate({ id: email.id, isStarred: !email.is_starred });
                          }}
                        >
                          <Star
                            className={cn(
                              "h-4 w-4",
                              email.is_starred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                            )}
                          />
                        </Button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-medium truncate",
                              !email.is_read && "font-bold"
                            )}>
                              {email.from_name || email.from_email}
                            </span>
                            {email.attachments && email.attachments.length > 0 && (
                              <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                          </div>
                          <p className={cn(
                            "text-sm truncate",
                            !email.is_read ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {email.subject || '(件名なし)'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {email.text_body?.substring(0, 100) || email.html_body?.replace(/<[^>]*>/g, '').substring(0, 100) || '(本文なし)'}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(email.created_at), 'M/d HH:mm', { locale: ja })}
                          </p>
                          {email.related_type && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              {email.related_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Email Detail Dialog */}
        <Dialog open={!!selectedEmail} onOpenChange={(open) => !open && setSelectedEmail(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
            {selectedEmail && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    {selectedEmail.subject || '(件名なし)'}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        {selectedEmail.from_name || selectedEmail.from_email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedEmail.from_email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        宛先: {selectedEmail.to_email}
                      </p>
                      {selectedEmail.cc_emails && selectedEmail.cc_emails.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          CC: {selectedEmail.cc_emails.join(', ')}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedEmail.created_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStar.mutate({
                        id: selectedEmail.id,
                        isStarred: !selectedEmail.is_starred
                      })}
                    >
                      <Star className={cn(
                        "mr-2 h-4 w-4",
                        selectedEmail.is_starred && "fill-yellow-400 text-yellow-400"
                      )} />
                      {selectedEmail.is_starred ? 'スター解除' : 'スター'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        archiveEmail.mutate(selectedEmail.id);
                        setSelectedEmail(null);
                      }}
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      アーカイブ
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        markAsSpam.mutate({
                          id: selectedEmail.id,
                          isSpam: !selectedEmail.is_spam
                        });
                      }}
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      {selectedEmail.is_spam ? 'スパム解除' : 'スパム'}
                    </Button>
                  </div>

                  {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Paperclip className="h-4 w-4" />
                        添付ファイル ({selectedEmail.attachments.length}件)
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedEmail.attachments.map((att, i) => (
                          <Badge key={i} variant="secondary">
                            {att.filename} ({Math.round(att.size / 1024)}KB)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    {selectedEmail.html_body ? (
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: selectedEmail.html_body }}
                      />
                    ) : (
                      <p className="whitespace-pre-wrap">
                        {selectedEmail.text_body || '(本文なし)'}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
