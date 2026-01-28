import { useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calculator,
  UserPlus,
  Settings,
  Search,
  Building2,
  Receipt,
  FileSignature,
  BookOpen,
  Clock,
  CreditCard,
  Workflow,
  Shield,
  Package,
  TrendingUp,
  Target,
  FolderKanban,
  History,
  X,
  Mail,
  MessageSquare,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { Button } from '@/components/ui/button';

interface SearchResult {
  id: string;
  type: 'page' | 'client' | 'invoice' | 'employee' | 'lead' | 'contract' | 'estimate' | 'wiki' | 'deal';
  title: string;
  subtitle?: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const pages: SearchResult[] = [
  { id: 'dashboard', type: 'page', title: 'ダッシュボード', url: '/dashboard', icon: LayoutDashboard },
  { id: 'leads', type: 'page', title: 'リード管理', url: '/leads', icon: Target },
  { id: 'deals', type: 'page', title: '商談', url: '/deals', icon: TrendingUp },
  { id: 'pipeline', type: 'page', title: 'パイプライン', url: '/pipeline', icon: Workflow },
  { id: 'clients', type: 'page', title: '取引先', url: '/clients', icon: Building2 },
  { id: 'invoices', type: 'page', title: '請求書', url: '/invoices', icon: Receipt },
  { id: 'estimates', type: 'page', title: '見積書', url: '/estimates', icon: FileText },
  { id: 'contracts', type: 'page', title: '契約書', url: '/contracts', icon: FileSignature },
  { id: 'employees', type: 'page', title: '従業員', url: '/employees', icon: Users },
  { id: 'attendance', type: 'page', title: '勤怠管理', url: '/attendance', icon: Clock },
  { id: 'payroll', type: 'page', title: '給与計算', url: '/payroll', icon: CreditCard },
  { id: 'recruiting', type: 'page', title: '採用管理', url: '/recruiting', icon: UserPlus },
  { id: 'candidates', type: 'page', title: '候補者', url: '/candidates', icon: Users },
  { id: 'projects', type: 'page', title: 'プロジェクト', url: '/projects', icon: FolderKanban },
  { id: 'accounting', type: 'page', title: '会計', url: '/accounting', icon: Calculator },
  { id: 'journal', type: 'page', title: '仕訳帳', url: '/accounting/journal', icon: BookOpen },
  { id: 'wiki', type: 'page', title: '社内Wiki', url: '/wiki', icon: BookOpen },
  { id: 'products', type: 'page', title: '商品管理', url: '/products', icon: Package },
  { id: 'inbound-emails', type: 'page', title: '受信メール', url: '/inbound-emails', icon: Mail },
  { id: 'line-settings', type: 'page', title: 'LINE連携', url: '/line-settings', icon: MessageSquare },
  { id: 'slack-integration', type: 'page', title: 'Slack連携', url: '/slack-integration', icon: MessageSquare },
  { id: 'settings', type: 'page', title: '設定', url: '/settings', icon: Settings },
  { id: 'sso', type: 'page', title: 'SSO設定', url: '/sso-settings', icon: Shield },
];

export interface GlobalSearchRef {
  open: () => void;
}

interface GlobalSearchProps {
  ref?: React.Ref<GlobalSearchRef>;
}

export const GlobalSearch = forwardRef<GlobalSearchRef, GlobalSearchProps>(
  function GlobalSearch(_, ref) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();
    const { history, addToHistory, removeFromHistory } = useSearchHistory();

    // Expose open method via ref
    useImperativeHandle(ref, () => ({
      open: () => setOpen(true),
    }));

    // Keyboard shortcut: Cmd+K and /
    useEffect(() => {
      const down = (e: KeyboardEvent) => {
        if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          setOpen((open) => !open);
        }
      };

      document.addEventListener('keydown', down);
      return () => document.removeEventListener('keydown', down);
    }, []);

    // Search database when query changes
    const searchDatabase = useCallback(async (searchQuery: string) => {
      if (!user?.id || searchQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      const searchResults: SearchResult[] = [];

      try {
        // Parallel search across all tables
        const [clientsRes, employeesRes, leadsRes, contractsRes, invoicesRes, estimatesRes, dealsRes, wikiRes] = await Promise.all([
          // Search clients
          supabase
            .from('clients')
            .select('id, name, email')
            .eq('user_id', user.id)
            .ilike('name', `%${searchQuery}%`)
            .limit(5),
          // Search employees
          supabase
            .from('employees')
            .select('id, name, department')
            .eq('user_id', user.id)
            .ilike('name', `%${searchQuery}%`)
            .limit(5),
          // Search leads
          supabase
            .from('leads')
            .select('id, company_name, contact_name')
            .eq('user_id', user.id)
            .ilike('company_name', `%${searchQuery}%`)
            .limit(5),
          // Search contracts
          supabase
            .from('contracts')
            .select('id, title, status')
            .eq('user_id', user.id)
            .ilike('title', `%${searchQuery}%`)
            .limit(5),
          // Search invoices
          supabase
            .from('invoices')
            .select('id, invoice_number, title')
            .eq('user_id', user.id)
            .or(`invoice_number.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%`)
            .limit(5),
          // Search estimates
          supabase
            .from('estimates')
            .select('id, estimate_number, title')
            .eq('user_id', user.id)
            .or(`estimate_number.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%`)
            .limit(5),
          // Search deals
          supabase
            .from('deals')
            .select('id, deal_name, stage')
            .eq('user_id', user.id)
            .ilike('deal_name', `%${searchQuery}%`)
            .limit(5),
          // Search wiki
          supabase
            .from('wiki_pages')
            .select('id, title, category')
            .eq('user_id', user.id)
            .ilike('title', `%${searchQuery}%`)
            .limit(5),
        ]);

        // Process clients
        if (clientsRes.data) {
          clientsRes.data.forEach((client) => {
            searchResults.push({
              id: client.id,
              type: 'client',
              title: client.name,
              subtitle: client.email || undefined,
              url: `/clients?id=${client.id}`,
              icon: Building2,
            });
          });
        }

        // Process employees
        if (employeesRes.data) {
          employeesRes.data.forEach((emp) => {
            searchResults.push({
              id: emp.id,
              type: 'employee',
              title: emp.name,
              subtitle: emp.department || undefined,
              url: `/employees?id=${emp.id}`,
              icon: Users,
            });
          });
        }

        // Process leads
        if (leadsRes.data) {
          leadsRes.data.forEach((lead) => {
            searchResults.push({
              id: lead.id,
              type: 'lead',
              title: lead.company_name,
              subtitle: lead.contact_name || undefined,
              url: `/leads?id=${lead.id}`,
              icon: Target,
            });
          });
        }

        // Process contracts
        if (contractsRes.data) {
          contractsRes.data.forEach((contract) => {
            searchResults.push({
              id: contract.id,
              type: 'contract',
              title: contract.title,
              subtitle: contract.status,
              url: `/contracts/${contract.id}`,
              icon: FileSignature,
            });
          });
        }

        // Process invoices
        if (invoicesRes.data) {
          invoicesRes.data.forEach((invoice) => {
            searchResults.push({
              id: invoice.id,
              type: 'invoice',
              title: invoice.title,
              subtitle: invoice.invoice_number,
              url: `/invoices?id=${invoice.id}`,
              icon: Receipt,
            });
          });
        }

        // Process estimates
        if (estimatesRes.data) {
          estimatesRes.data.forEach((estimate) => {
            searchResults.push({
              id: estimate.id,
              type: 'estimate',
              title: estimate.title,
              subtitle: estimate.estimate_number,
              url: `/estimates?id=${estimate.id}`,
              icon: FileText,
            });
          });
        }

        // Process deals
        if (dealsRes.data) {
          dealsRes.data.forEach((deal) => {
            searchResults.push({
              id: deal.id,
              type: 'deal',
              title: deal.deal_name,
              subtitle: deal.stage || undefined,
              url: `/deals?id=${deal.id}`,
              icon: TrendingUp,
            });
          });
        }

        // Process wiki
        if (wikiRes.data) {
          wikiRes.data.forEach((page) => {
            searchResults.push({
              id: page.id,
              type: 'wiki',
              title: page.title,
              subtitle: page.category || 'Wiki',
              url: `/wiki/${page.id}`,
              icon: BookOpen,
            });
          });
        }

        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, [user?.id]);

    // Debounced search
    useEffect(() => {
      const timer = setTimeout(() => {
        if (query.length >= 2) {
          searchDatabase(query);
        } else {
          setResults([]);
        }
      }, 300);

      return () => clearTimeout(timer);
    }, [query, searchDatabase]);

    const filteredPages = pages.filter((page) =>
      page.title.toLowerCase().includes(query.toLowerCase())
    );

    const handleSelect = (url: string, addHistory = true) => {
      if (addHistory && query.length >= 2) {
        addToHistory(query);
      }
      setOpen(false);
      setQuery('');
      navigate(url);
    };

    const handleHistorySelect = (historyQuery: string) => {
      setQuery(historyQuery);
    };

    // Group results by type
    const resultsByType = {
      client: results.filter((r) => r.type === 'client'),
      employee: results.filter((r) => r.type === 'employee'),
      lead: results.filter((r) => r.type === 'lead'),
      deal: results.filter((r) => r.type === 'deal'),
      contract: results.filter((r) => r.type === 'contract'),
      invoice: results.filter((r) => r.type === 'invoice'),
      estimate: results.filter((r) => r.type === 'estimate'),
      wiki: results.filter((r) => r.type === 'wiki'),
    };

    const typeLabels: Record<string, string> = {
      client: '取引先',
      employee: '従業員',
      lead: 'リード',
      deal: '商談',
      contract: '契約書',
      invoice: '請求書',
      estimate: '見積書',
      wiki: 'Wiki',
    };

    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground border rounded-md hover:bg-accent transition-colors"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">検索...</span>
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>

        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput
            placeholder="ページ、取引先、請求書、Wiki などを検索..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList className="max-h-[400px]">
            <CommandEmpty>
              {isSearching ? '検索中...' : '結果が見つかりません'}
            </CommandEmpty>

            {/* Search History - show when no query */}
            {query.length < 2 && history.length > 0 && (
              <CommandGroup heading="最近の検索">
                {history.slice(0, 5).map((item) => (
                  <CommandItem
                    key={item.timestamp}
                    value={`history-${item.query}`}
                    onSelect={() => handleHistorySelect(item.query)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4 text-muted-foreground" />
                      <span>{item.query}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-50 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(item.query);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {filteredPages.length > 0 && (
              <CommandGroup heading="ページ">
                {filteredPages.slice(0, 8).map((page) => (
                  <CommandItem
                    key={page.id}
                    value={page.title}
                    onSelect={() => handleSelect(page.url, false)}
                  >
                    <page.icon className="mr-2 h-4 w-4" />
                    {page.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.length > 0 && (
              <>
                <CommandSeparator />
                {Object.entries(resultsByType).map(([type, typeResults]) => {
                  if (typeResults.length === 0) return null;
                  return (
                    <CommandGroup key={type} heading={typeLabels[type]}>
                      {typeResults.map((result) => (
                        <CommandItem
                          key={result.id}
                          value={`${result.type}-${result.title}`}
                          onSelect={() => handleSelect(result.url)}
                        >
                          <result.icon className="mr-2 h-4 w-4" />
                          <div className="flex flex-col">
                            <span>{result.title}</span>
                            {result.subtitle && (
                              <span className="text-xs text-muted-foreground">
                                {result.subtitle}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  );
                })}
              </>
            )}
          </CommandList>
          
          <div className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center gap-4">
            <span>
              <kbd className="px-1 py-0.5 bg-muted rounded">↑↓</kbd> 移動
            </span>
            <span>
              <kbd className="px-1 py-0.5 bg-muted rounded">Enter</kbd> 選択
            </span>
            <span>
              <kbd className="px-1 py-0.5 bg-muted rounded">Esc</kbd> 閉じる
            </span>
          </div>
        </CommandDialog>
      </>
    );
  }
);
