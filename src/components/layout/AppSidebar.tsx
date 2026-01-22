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
  MessageSquare,
  MessageSquarePlus,
  CircleDollarSign,
  FolderKanban,
  GanttChart,
  Timer,
  Briefcase,
  UserSearch,
  CalendarCheck,
  FileBarChart,
  Stethoscope,
  ClipboardCheck,
  UserRound,
  FileHeart,
  KeySquare,
  Pill,
  Home,
  Video,
  HeartPulse,
  Ticket,
  HelpCircle,
  Bot,
  Phone,
  HeartHandshake,
  Megaphone,
  Layout,
  Share2,
  Store,
  Smartphone,
  Award,
  Lightbulb,
  UserCheck,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";
import { useState, useEffect } from "react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { useAppSettings } from "@/contexts/SettingsContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CompanySwitcher } from "@/components/layout/CompanySwitcher";
import { useBrandingSettings } from "@/hooks/useBrandingSettings";
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
import { Badge } from "@/components/ui/badge";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  onChatOpen?: () => void;
}

// Storage key for collapsed groups
const COLLAPSED_GROUPS_KEY = "sidebar-collapsed-groups";

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  'getting-started': Sparkles,
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
  notifications: Bell,
  team: Users,
  'bank-connections': Building2,
  workflows: Workflow,
  products: Package,
  'auto-reorder': ShoppingCart,
  'payment-links': CreditCard,
  'email-templates': Mail,
  'contract-alerts': AlertTriangle,
  'audit-log': History,
  payslips: Receipt,
  'receipt-capture': Camera,
  'lead-scoring': Brain,
  'e-bookkeeping': FileCheck,
  'my-number': Lock,
  'email-integration': MailCheck,
  'wiki-hierarchy': FolderTree,
  'sales-forecast': TrendingUp,
  'database-views': Table2,
  'social-insurance': ShieldCheck,
  'approval-workflow': GitBranch,
  'sso-settings': KeyRound,
  'line-settings': MessageSquare,
  'ai-settings': Brain,
  'data-import': FolderTree,
  credits: Coins,
  'credit-logs': History,
  pricing: Sparkles,
  referrals: Gift,
  'settings-menu': Menu,
  developer: Code,
  'api-docs': Book,
  'mcp-settings': Plug,
  'expense-list': CircleDollarSign,
  'advance-payment': Wallet,
  'expense-settings': Settings,
  projects: FolderKanban,
  timelog: Timer,
  recruiting: Briefcase,
  'job-postings': FileText,
  candidates: UserSearch,
  interviews: CalendarCheck,
  'recruiting-reports': FileBarChart,
  'emr-dashboard': Stethoscope,
  'emr-reception': ClipboardCheck,
  'emr-patients': UserRound,
  'emr-records': FileHeart,
  'emr-sales': TrendingUp,
  'emr-hpki': KeySquare,
  'emr-appointments': CalendarDays,
  'emr-billing': Receipt,
  'emr-pharmacy': Pill,
  'emr-inquiry': ClipboardList,
  'emr-home-visit': Home,
  'emr-telemedicine': Video,
  'emr-health-checkup': HeartPulse,
  'members-dashboard': Users,
  'members-list': Users,
  'membership-plans': CreditCard,
  'class-schedules': CalendarDays,
  'class-bookings': CalendarCheck,
  'member-checkins': UserCheck,
  'member-purchases': ShoppingCart,
  'tickets': Ticket,
  'help-center': HelpCircle,
  'chatbot': Bot,
  'cti': Phone,
  'customer-success': HeartHandshake,
  'community': Users,
  'email-marketing': Mail,
  'campaigns': Megaphone,
  'lp-builder': Layout,
  'web-analytics': BarChart3,
  'ad-management': Target,
  'sns-management': Share2,
  'cloud-pos': ShoppingCart,
  'ec-site': Store,
  'omni-inventory': Package,
  'store-shift': CalendarDays,
  'member-app': Smartphone,
  'loyalty-points': Gift,
  'courses': BookOpen,
  'tests': ClipboardList,
  'study-history': History,
  'skill-map': Map,
  'certifications': Award,
  'shareholder-meetings': Users,
  'corporate-registry': FileText,
  'whistleblowing': AlertTriangle,
  'antisocial-check': Shield,
  'ip-management': Lightbulb,
  'vacation-dashboard': Palmtree,
  'vacation-properties': Home,
  'vacation-bookings': CalendarDays,
  'vacation-calendar': CalendarCheck,
  'vacation-guests': Users,
  'vacation-cleaning': Sparkles,
  'vacation-operating-days': CalendarDays,
  'estate-properties': Building2,
  'estate-tenants': Users,
  'estate-owner-dashboard': LayoutDashboard,
  'estate-proration': Calculator,
  'estate-reconciliation': ArrowLeftRight,
};

// URL mapping
const urlMap: Record<string, string> = {
  dashboard: '/dashboard',
  'getting-started': '/getting-started',
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
  pages: '/dev/pages',
  notifications: '/notifications',
  team: '/team',
  'bank-connections': '/bank-connections',
  workflows: '/workflows',
  products: '/products',
  'auto-reorder': '/auto-reorder',
  'payment-links': '/payment-links',
  'email-templates': '/email-templates',
  'contract-alerts': '/contract-alerts',
  'audit-log': '/audit-log',
  payslips: '/payslips',
  'receipt-capture': '/receipt-capture',
  'lead-scoring': '/lead-scoring',
  'e-bookkeeping': '/e-bookkeeping',
  'my-number': '/my-number',
  'email-integration': '/email-integration',
  'wiki-hierarchy': '/wiki-hierarchy',
  'sales-forecast': '/sales-forecast',
  'database-views': '/database-views',
  'social-insurance': '/social-insurance',
  'approval-workflow': '/approval-workflow',
  'sso-settings': '/sso-settings',
  credits: '/credits',
  'credit-logs': '/credit-logs',
  pricing: '/pricing',
  referrals: '/referrals',
  'line-settings': '/line-settings',
  'ai-settings': '/ai-settings',
  'data-import': '/data-import',
  'settings-menu': '/settings/menu',
  developer: '/developer',
  'api-docs': '/api-docs',
  'mcp-settings': '/mcp-settings',
  'expense-list': '/expenses',
  'advance-payment': '/advance-payment',
  'expense-settings': '/expenses/settings',
  projects: '/projects',
  timelog: '/timelog',
  recruiting: '/recruiting',
  'job-postings': '/job-postings',
  candidates: '/candidates',
  interviews: '/interviews',
  'recruiting-reports': '/recruiting/reports',
  'emr-dashboard': '/emr',
  'emr-reception': '/emr/reception',
  'emr-patients': '/emr/patients',
  'emr-records': '/emr/records',
  'emr-sales': '/emr/sales',
  'emr-hpki': '/emr/hpki',
  'emr-appointments': '/emr/appointments',
  'emr-billing': '/emr/billing',
  'emr-pharmacy': '/emr/pharmacy',
  'emr-inquiry': '/emr/inquiry',
  'emr-home-visit': '/emr/home-visit',
  'emr-telemedicine': '/emr/telemedicine',
  'emr-health-checkup': '/emr/health-checkup',
  'members-dashboard': '/membership',
  'members-list': '/membership/members',
  'membership-plans': '/membership/plans',
  'class-schedules': '/membership/schedules',
  'class-bookings': '/membership/bookings',
  'member-checkins': '/membership/checkins',
  'member-purchases': '/membership/purchases',
  'tickets': '/support/tickets',
  'help-center': '/support/help-center',
  'chatbot': '/support/chatbot',
  'cti': '/support/cti',
  'customer-success': '/support/customer-success',
  'community': '/support/community',
  'email-marketing': '/marketing/email',
  'campaigns': '/marketing/campaigns',
  'lp-builder': '/marketing/lp-builder',
  'web-analytics': '/marketing/analytics',
  'ad-management': '/marketing/ads',
  'sns-management': '/marketing/sns',
  'cloud-pos': '/retail/pos',
  'ec-site': '/retail/ec-site',
  'omni-inventory': '/retail/inventory',
  'store-shift': '/retail/shift',
  'member-app': '/retail/member-app',
  'loyalty-points': '/retail/points',
  'courses': '/lms/courses',
  'tests': '/lms/tests',
  'study-history': '/lms/history',
  'skill-map': '/lms/skill-map',
  'certifications': '/lms/certifications',
  'shareholder-meetings': '/legal/shareholder-meetings',
  'corporate-registry': '/legal/registry',
  'whistleblowing': '/legal/whistleblowing',
  'antisocial-check': '/legal/antisocial-check',
  'ip-management': '/legal/ip',
  'vacation-dashboard': '/vacation-rental',
  'vacation-properties': '/vacation-rental/properties',
  'vacation-bookings': '/vacation-rental/bookings',
  'vacation-calendar': '/vacation-rental/calendar',
  'vacation-guests': '/vacation-rental/guests',
  'vacation-cleaning': '/vacation-rental/cleaning',
  'vacation-operating-days': '/vacation-rental/operating-days',
  'estate-properties': '/estate/properties',
  'estate-tenants': '/estate/tenants',
  'estate-owner-dashboard': '/estate/owner-dashboard',
  'estate-proration': '/estate/proration',
  'estate-reconciliation': '/estate/reconciliation',
};

// Group icon mapping
const groupIconMap: Record<string, LucideIcon> = {
  main: LayoutDashboard,
  crm: Users,
  sales: FileText,
  finance: Calculator,
  accounting: Calculator,
  hr: Users,
  knowledge: Book,
  system: Settings,
  integrations: Plug,
  emr: Stethoscope,
  membership: Users,
  support: HelpCircle,
  marketing: Megaphone,
  retail: ShoppingCart,
  lms: BookOpen,
  legal: Scale,
  'vacation-rental': Palmtree,
  estate: Building2,
  expense: Wallet,
  project: FolderKanban,
  recruiting: Briefcase,
};

export function AppSidebar({ onChatOpen }: AppSidebarProps) {
  const { signOut, user } = useAuth();
  const { settings } = useAppSettings();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { brandingSettings, logoUrl } = useBrandingSettings();

  // Load collapsed groups from localStorage
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(COLLAPSED_GROUPS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Save collapsed groups to localStorage
  useEffect(() => {
    localStorage.setItem(COLLAPSED_GROUPS_KEY, JSON.stringify(collapsedGroups));
  }, [collapsedGroups]);

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Sort and filter menu groups based on settings
  const visibleGroups = settings.menuGroups
    .filter(group => group.visible)
    .sort((a, b) => a.order - b.order);

  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex flex-col gap-3 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {logoUrl && brandingSettings.showLogoSidebar ? (
                <img 
                  src={logoUrl} 
                  alt="Company Logo" 
                  className="h-8 w-8 shrink-0 object-contain group-data-[collapsible=icon]:w-8"
                />
              ) : (
                <>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-foreground bg-foreground text-background font-bold">
                    T
                  </div>
                  <span className="text-xl font-bold tracking-tight group-data-[collapsible=icon]:hidden">Totonos</span>
                </>
              )}
            </div>
            <div className="group-data-[collapsible=icon]:hidden">
              <ThemeToggle />
            </div>
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <CompanySwitcher collapsed={collapsed} />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin">
        {visibleGroups.map(group => {
          const visibleItems = group.items
            .filter(item => item.visible)
            .sort((a, b) => a.order - b.order);

          if (visibleItems.length === 0) return null;

          const GroupIcon = groupIconMap[group.id] || LayoutDashboard;
          const isCollapsed = collapsedGroups[group.id] ?? false;

          // For single-item groups like "main", render without collapsible
          if (visibleItems.length === 1 && group.id === 'main') {
            const item = visibleItems[0];
            const Icon = iconMap[item.id] || LayoutDashboard;
            const url = urlMap[item.id] || '/';

            return (
              <SidebarGroup key={group.id} className="py-1">
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <NavLink
                          to={url}
                          className="flex items-center gap-2 hover:bg-accent"
                          activeClassName="bg-accent font-medium"
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate group-data-[collapsible=icon]:hidden">{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          }

          return (
            <Collapsible
              key={group.id}
              open={!isCollapsed}
              onOpenChange={() => toggleGroup(group.id)}
              className="group/collapsible"
            >
              <SidebarGroup className="py-1">
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="cursor-pointer hover:bg-accent/50 rounded-md transition-colors px-2 py-1.5 flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <GroupIcon className="h-3.5 w-3.5 shrink-0 group-data-[collapsible=icon]:hidden" />
                      <span className="group-data-[collapsible=icon]:hidden">{group.label}</span>
                    </div>
                    <ChevronDown className={cn(
                      "h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-data-[collapsible=icon]:hidden",
                      isCollapsed ? "-rotate-90" : "rotate-0"
                    )} />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {visibleItems.map((item) => {
                        const Icon = iconMap[item.id] || LayoutDashboard;
                        const url = urlMap[item.id] || '/';

                        return (
                          <SidebarMenuItem key={item.id}>
                            <SidebarMenuButton asChild tooltip={item.title}>
                              <NavLink
                                to={url}
                                className="flex items-center gap-2 hover:bg-accent"
                                activeClassName="bg-accent font-medium"
                              >
                                <Icon className="h-4 w-4 shrink-0" />
                                <span className="truncate group-data-[collapsible=icon]:hidden">{item.title}</span>
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-2">
        <div className="flex flex-col gap-1">
          {/* AI Assistant */}
          {onChatOpen && (
            <SidebarMenuButton asChild tooltip="AIアシスタント">
              <Button
                variant="ghost"
                size="sm"
                onClick={onChatOpen}
                className="w-full justify-start gap-2 hover:bg-primary/10"
              >
                <MessageCircle className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate group-data-[collapsible=icon]:hidden">AIアシスタント</span>
              </Button>
            </SidebarMenuButton>
          )}

          {/* Theme toggle for collapsed mode */}
          <div className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center hidden">
            <ThemeToggle />
          </div>

          {/* User Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 hover:bg-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
              >
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-xs text-muted-foreground group-data-[collapsible=icon]:hidden flex-1 text-left">
                  {user?.email}
                </span>
                <MoreHorizontal className="h-4 w-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <NavLink to="/profile" className="cursor-pointer">
                  <UserCircle className="h-4 w-4 mr-2" />
                  プロフィール
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/settings" className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  設定
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFeedbackOpen(true)}>
                <MessageSquarePlus className="h-4 w-4 mr-2" />
                バグ報告・機能要望
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                ログアウト
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Beta Badge */}
          <div className="pt-1 flex justify-center group-data-[collapsible=icon]:pt-1">
            <Badge variant="secondary" className="bg-amber-500/90 text-amber-950 hover:bg-amber-500 border-0 font-semibold px-2 py-0.5 text-[10px] leading-tight">
              <span className="group-data-[collapsible=icon]:hidden">🚧 ベータ版</span>
              <span className="hidden group-data-[collapsible=icon]:inline">β</span>
            </Badge>
          </div>
        </div>
        
        <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
      </SidebarFooter>
    </Sidebar>
  );
}
