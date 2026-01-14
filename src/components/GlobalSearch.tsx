import { useEffect, useState, useCallback } from 'react';
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
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SearchResult {
  id: string;
  type: 'page' | 'client' | 'invoice' | 'employee' | 'lead' | 'contract';
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
  { id: 'settings', type: 'page', title: '設定', url: '/settings', icon: Settings },
  { id: 'sso', type: 'page', title: 'SSO設定', url: '/settings/sso', icon: Shield },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Keyboard shortcut
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
      // Search clients
      const { data: clients } = await supabase
        .from('clients')
        .select('id, name, email')
        .eq('user_id', user.id)
        .ilike('name', `%${searchQuery}%`)
        .limit(5);

      if (clients) {
        clients.forEach((client) => {
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

      // Search employees
      const { data: employees } = await supabase
        .from('employees')
        .select('id, name, department')
        .eq('user_id', user.id)
        .ilike('name', `%${searchQuery}%`)
        .limit(5);

      if (employees) {
        employees.forEach((emp) => {
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

      // Search leads
      const { data: leads } = await supabase
        .from('leads')
        .select('id, company_name, contact_name')
        .eq('user_id', user.id)
        .ilike('company_name', `%${searchQuery}%`)
        .limit(5);

      if (leads) {
        leads.forEach((lead) => {
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

      // Search contracts
      const { data: contracts } = await supabase
        .from('contracts')
        .select('id, title, status')
        .eq('user_id', user.id)
        .ilike('title', `%${searchQuery}%`)
        .limit(5);

      if (contracts) {
        contracts.forEach((contract) => {
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

  const handleSelect = (url: string) => {
    setOpen(false);
    setQuery('');
    navigate(url);
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
          placeholder="ページ、取引先、従業員を検索..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {isSearching ? '検索中...' : '結果が見つかりません'}
          </CommandEmpty>

          {filteredPages.length > 0 && (
            <CommandGroup heading="ページ">
              {filteredPages.slice(0, 8).map((page) => (
                <CommandItem
                  key={page.id}
                  value={page.title}
                  onSelect={() => handleSelect(page.url)}
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
              {results.filter((r) => r.type === 'client').length > 0 && (
                <CommandGroup heading="取引先">
                  {results
                    .filter((r) => r.type === 'client')
                    .map((result) => (
                      <CommandItem
                        key={result.id}
                        value={result.title}
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
              )}

              {results.filter((r) => r.type === 'employee').length > 0 && (
                <CommandGroup heading="従業員">
                  {results
                    .filter((r) => r.type === 'employee')
                    .map((result) => (
                      <CommandItem
                        key={result.id}
                        value={result.title}
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
              )}

              {results.filter((r) => r.type === 'lead').length > 0 && (
                <CommandGroup heading="リード">
                  {results
                    .filter((r) => r.type === 'lead')
                    .map((result) => (
                      <CommandItem
                        key={result.id}
                        value={result.title}
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
              )}

              {results.filter((r) => r.type === 'contract').length > 0 && (
                <CommandGroup heading="契約">
                  {results
                    .filter((r) => r.type === 'contract')
                    .map((result) => (
                      <CommandItem
                        key={result.id}
                        value={result.title}
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
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
