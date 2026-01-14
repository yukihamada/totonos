import {
  LayoutDashboard,
  FileText,
  Users,
  ArrowLeftRight,
  Zap,
  Shield,
  BarChart3,
  Settings,
  LogOut,
  FileSignature,
  Calculator,
  BookOpen,
  PieChart,
  Building2,
  Wallet,
  UserPlus,
  Target,
  Book,
  Laptop,
  Clock,
  DollarSign,
  FileCheck,
  UserCircle,
  ClipboardList,
  ShoppingCart,
  Activity,
  Kanban,
  Scale,
  Banknote,
  CalendarDays,
  Palmtree,
  Map,
  LucideIcon,
  Bell,
  Workflow,
  Package,
  CreditCard,
  Mail,
  AlertTriangle,
  History,
  Receipt,
  Camera,
  Brain,
  Lock,
  MailCheck,
  FolderTree,
  TrendingUp,
  Table2,
  ShieldCheck,
  GitBranch,
  KeyRound,
  Coins,
  Gift,
  Sparkles,
  Menu,
  Code,
  Plug,
  MessageCircle,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { useAppSettings } from "@/contexts/SettingsContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface AppSidebarProps {
  onChatOpen?: () => void;
}

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  leads: UserPlus,
  deals: Target,
  pipeline: Kanban,
  activities: Activity,
  clients: Users,
  invoices: FileText,
  estimates: ClipboardList,
  'purchase-orders': ShoppingCart,
  contracts: FileSignature,
  reconciliation: ArrowLeftRight,
  boost: Zap,
  'trust-passport': Shield,
  accounting: Calculator,
  journal: BookOpen,
  statements: PieChart,
  budget: Scale,
  receivables: Banknote,
  assets: Building2,
  expenses: Wallet,
  employees: Users,
  attendance: Clock,
  shifts: CalendarDays,
  'leave-requests': Palmtree,
  payroll: DollarSign,
  'year-end': FileCheck,
  wiki: Book,
  'it-assets': Laptop,
  reports: BarChart3,
  profile: UserCircle,
  settings: Settings,
  pages: Map,
  // New features
  notifications: Bell,
  team: Users,
  'bank-connections': Building2,
  workflows: Workflow,
  products: Package,
  'payment-links': CreditCard,
  'email-templates': Mail,
  // Phase 1 competitive features
  'contract-alerts': AlertTriangle,
  'audit-log': History,
  payslips: Receipt,
  'receipt-capture': Camera,
  'lead-scoring': Brain,
  'e-bookkeeping': FileCheck,
  'my-number': Lock,
  'email-integration': MailCheck,
  // Phase 2 differentiation features
  'wiki-hierarchy': FolderTree,
  'sales-forecast': TrendingUp,
  'database-views': Table2,
  'social-insurance': ShieldCheck,
  'approval-workflow': GitBranch,
  'sso-settings': KeyRound,
  // Credit system
  credits: Coins,
  'credit-logs': History,
  pricing: Sparkles,
  referrals: Gift,
  // Developer & Settings
  'settings-menu': Menu,
  developer: Code,
  'api-docs': Book,
  'mcp-settings': Plug,
};

// URL mapping
const urlMap: Record<string, string> = {
  dashboard: '/dashboard',
  leads: '/leads',
  deals: '/deals',
  pipeline: '/pipeline',
  activities: '/activities',
  clients: '/clients',
  invoices: '/invoices',
  estimates: '/estimates',
  'purchase-orders': '/purchase-orders',
  contracts: '/contracts',
  reconciliation: '/reconciliation',
  boost: '/boost',
  'trust-passport': '/trust-passport',
  accounting: '/accounting',
  journal: '/accounting/journal',
  statements: '/accounting/statements',
  budget: '/accounting/budget',
  receivables: '/accounting/receivables',
  assets: '/accounting/assets',
  expenses: '/accounting/expenses',
  employees: '/employees',
  attendance: '/attendance',
  shifts: '/shifts',
  'leave-requests': '/leave-requests',
  payroll: '/payroll',
  'year-end': '/year-end',
  wiki: '/wiki',
  'it-assets': '/it-assets',
  reports: '/reports',
  profile: '/profile',
  settings: '/settings',
  pages: '/pages',
  // New features
  notifications: '/notifications',
  team: '/team',
  'bank-connections': '/bank-connections',
  workflows: '/workflows',
  products: '/products',
  'payment-links': '/payment-links',
  'email-templates': '/email-templates',
  // Phase 1 competitive features
  'contract-alerts': '/contract-alerts',
  'audit-log': '/audit-log',
  payslips: '/payslips',
  'receipt-capture': '/receipt-capture',
  'lead-scoring': '/lead-scoring',
  'e-bookkeeping': '/e-bookkeeping',
  'my-number': '/my-number',
  'email-integration': '/email-integration',
  // Phase 2 differentiation features
  'wiki-hierarchy': '/wiki-hierarchy',
  'sales-forecast': '/sales-forecast',
  'database-views': '/database-views',
  'social-insurance': '/social-insurance',
  'approval-workflow': '/approval-workflow',
  'sso-settings': '/sso-settings',
  // Credit system
  credits: '/credits',
  'credit-logs': '/credit-logs',
  pricing: '/pricing',
  referrals: '/referrals',
  // Developer & Settings
  'settings-menu': '/settings/menu',
  developer: '/developer',
  'api-docs': '/api-docs',
  'mcp-settings': '/mcp-settings',
};

export function AppSidebar({ onChatOpen }: AppSidebarProps) {
  const { signOut, user } = useAuth();
  const { settings } = useAppSettings();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  // Sort and filter menu groups based on settings
  const visibleGroups = settings.menuGroups
    .filter(group => group.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center border-2 border-foreground bg-foreground text-background font-bold">
              T
            </div>
            {!collapsed && (
              <span className="text-xl font-bold tracking-tight">Totonos</span>
            )}
          </div>
          {!collapsed && <ThemeToggle />}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {visibleGroups.map(group => {
          const visibleItems = group.items
            .filter(item => item.visible)
            .sort((a, b) => a.order - b.order);

          if (visibleItems.length === 0) return null;

          return (
            <SidebarGroup key={group.id}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => {
                    const Icon = iconMap[item.id] || LayoutDashboard;
                    const url = urlMap[item.id] || '/';

                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton asChild>
                          <NavLink 
                            to={url} 
                            className="flex items-center gap-2 hover:bg-accent"
                            activeClassName="bg-accent font-medium"
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <div className="flex flex-col gap-2">
          {onChatOpen && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onChatOpen}
              className="w-full justify-start gap-2 bg-primary/5 hover:bg-primary/10 border-primary/20"
            >
              <MessageCircle className="h-4 w-4 text-primary" />
              {!collapsed && <span>AIアシスタント</span>}
            </Button>
          )}
          {collapsed && (
            <ThemeToggle />
          )}
          {!collapsed && user && (
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={signOut}
            className="w-full justify-start gap-2"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>ログアウト</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
