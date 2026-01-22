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
  // Phase 4 icons
  CircleDollarSign,
  FolderKanban,
  GanttChart,
  Timer,
  Briefcase,
  UserSearch,
  CalendarCheck,
  FileBarChart,
  // EMR icons
  Stethoscope,
  ClipboardCheck,
  UserRound,
  FileHeart,
  KeySquare,
  Pill,
  Home,
  Video,
  HeartPulse,
  // New category icons
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
} from "lucide-react";
import { useState } from "react";
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

interface AppSidebarProps {
  onChatOpen?: () => void;
}

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
  // New features
  notifications: Bell,
  team: Users,
  'bank-connections': Building2,
  workflows: Workflow,
  products: Package,
  'auto-reorder': ShoppingCart,
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
  'line-settings': MessageSquare,
  'ai-settings': Brain,
  'data-import': FolderTree,
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
  // Phase 4: Expense Management
  'expense-list': CircleDollarSign,
  'advance-payment': Wallet,
  'expense-settings': Settings,
  // Phase 4: Project Management
  projects: FolderKanban,
  timelog: Timer,
  // Phase 4: Recruiting
  recruiting: Briefcase,
  'job-postings': FileText,
  candidates: UserSearch,
  interviews: CalendarCheck,
  'recruiting-reports': FileBarChart,
  // EMR
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
  // Membership
  'members-dashboard': Users,
  'members-list': Users,
  'membership-plans': CreditCard,
  'class-schedules': CalendarDays,
  'class-bookings': CalendarCheck,
  'member-checkins': UserCheck,
  'member-purchases': ShoppingCart,
  // Support/CS
  'tickets': Ticket,
  'help-center': HelpCircle,
  'chatbot': Bot,
  'cti': Phone,
  'customer-success': HeartHandshake,
  'community': Users,
  // Marketing
  'email-marketing': Mail,
  'campaigns': Megaphone,
  'lp-builder': Layout,
  'web-analytics': BarChart3,
  'ad-management': Target,
  'sns-management': Share2,
  // Retail/EC
  'cloud-pos': ShoppingCart,
  'ec-site': Store,
  'omni-inventory': Package,
  'store-shift': CalendarDays,
  'member-app': Smartphone,
  'loyalty-points': Gift,
  // LMS
  'courses': BookOpen,
  'tests': ClipboardList,
  'study-history': History,
  'skill-map': Map,
  'certifications': Award,
  // Legal/Governance
  'shareholder-meetings': Users,
  'corporate-registry': FileText,
  'whistleblowing': AlertTriangle,
  'antisocial-check': Shield,
  'ip-management': Lightbulb,
  // Vacation Rental
  'vacation-dashboard': Palmtree,
  'vacation-properties': Home,
  'vacation-bookings': CalendarDays,
  'vacation-calendar': CalendarCheck,
  'vacation-guests': Users,
  'vacation-cleaning': Sparkles,
  'vacation-operating-days': CalendarDays,
  // Estate Management
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
  // New features
  notifications: '/notifications',
  team: '/team',
  'bank-connections': '/bank-connections',
  workflows: '/workflows',
  products: '/products',
  'auto-reorder': '/auto-reorder',
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
  'line-settings': '/line-settings',
  'ai-settings': '/ai-settings',
  'data-import': '/data-import',
  'settings-menu': '/settings/menu',
  developer: '/developer',
  'api-docs': '/api-docs',
  'mcp-settings': '/mcp-settings',
  // Phase 4: Expense Management
  'expense-list': '/expenses',
  'advance-payment': '/advance-payment',
  'expense-settings': '/expenses/settings',
  // Phase 4: Project Management
  projects: '/projects',
  timelog: '/timelog',
  // Phase 4: Recruiting
  recruiting: '/recruiting',
  'job-postings': '/job-postings',
  candidates: '/candidates',
  interviews: '/interviews',
  'recruiting-reports': '/recruiting/reports',
  // EMR
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
  // Membership
  'members-dashboard': '/membership',
  'members-list': '/membership/members',
  'membership-plans': '/membership/plans',
  'class-schedules': '/membership/schedules',
  'class-bookings': '/membership/bookings',
  'member-checkins': '/membership/checkins',
  'member-purchases': '/membership/purchases',
  // Support/CS
  'tickets': '/support/tickets',
  'help-center': '/support/help-center',
  'chatbot': '/support/chatbot',
  'cti': '/support/cti',
  'customer-success': '/support/customer-success',
  'community': '/support/community',
  // Marketing
  'email-marketing': '/marketing/email',
  'campaigns': '/marketing/campaigns',
  'lp-builder': '/marketing/lp-builder',
  'web-analytics': '/marketing/analytics',
  'ad-management': '/marketing/ads',
  'sns-management': '/marketing/sns',
  // Retail/EC
  'cloud-pos': '/retail/pos',
  'ec-site': '/retail/ec-site',
  'omni-inventory': '/retail/inventory',
  'store-shift': '/retail/shift',
  'member-app': '/retail/member-app',
  'loyalty-points': '/retail/points',
  // LMS
  'courses': '/lms/courses',
  'tests': '/lms/tests',
  'study-history': '/lms/history',
  'skill-map': '/lms/skill-map',
  'certifications': '/lms/certifications',
  // Legal/Governance
  'shareholder-meetings': '/legal/shareholder-meetings',
  'corporate-registry': '/legal/registry',
  'whistleblowing': '/legal/whistleblowing',
  'antisocial-check': '/legal/antisocial-check',
  'ip-management': '/legal/ip',
  // Vacation Rental
  'vacation-dashboard': '/vacation-rental',
  'vacation-properties': '/vacation-rental/properties',
  'vacation-bookings': '/vacation-rental/bookings',
  'vacation-calendar': '/vacation-rental/calendar',
  'vacation-guests': '/vacation-rental/guests',
  'vacation-cleaning': '/vacation-rental/cleaning',
  'vacation-operating-days': '/vacation-rental/operating-days',
  // Estate Management
  'estate-properties': '/estate/properties',
  'estate-tenants': '/estate/tenants',
  'estate-owner-dashboard': '/estate/owner-dashboard',
  'estate-proration': '/estate/proration',
  'estate-reconciliation': '/estate/reconciliation',
};

export function AppSidebar({ onChatOpen }: AppSidebarProps) {
  const { signOut, user } = useAuth();
  const { settings } = useAppSettings();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { brandingSettings, logoUrl } = useBrandingSettings();

  // Sort and filter menu groups based on settings
  const visibleGroups = settings.menuGroups
    .filter(group => group.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex flex-col gap-3 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {/* Custom logo from branding settings */}
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
          {/* Company Switcher */}
          <div className="group-data-[collapsible=icon]:hidden">
            <CompanySwitcher collapsed={collapsed} />
          </div>
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
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-2">
        <div className="flex flex-col gap-1">
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
          <div className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center hidden">
            <ThemeToggle />
          </div>
          <p className="text-xs text-muted-foreground truncate px-2 group-data-[collapsible=icon]:hidden">
            {user?.email}
          </p>
          <SidebarMenuButton asChild tooltip="ログアウト">
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="w-full justify-start gap-2"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="truncate group-data-[collapsible=icon]:hidden">ログアウト</span>
            </Button>
          </SidebarMenuButton>
          
          {/* Feedback & Beta - Below logout */}
          <div className="pt-2 border-t border-border mt-2 group-data-[collapsible=icon]:pt-1 group-data-[collapsible=icon]:mt-1">
            <div className="flex items-center gap-2 mb-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mb-1">
              <Badge variant="secondary" className="bg-amber-500/90 text-amber-950 hover:bg-amber-500 border-0 font-semibold px-2 py-0.5 text-[10px] leading-tight group-data-[collapsible=icon]:px-1">
                <span className="group-data-[collapsible=icon]:hidden">🚧 ベータ版</span>
                <span className="hidden group-data-[collapsible=icon]:inline">β</span>
              </Badge>
            </div>
            <SidebarMenuButton asChild tooltip="バグ報告・機能要望">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFeedbackOpen(true)}
                className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
              >
                <MessageSquarePlus className="h-4 w-4 shrink-0" />
                <span className="truncate group-data-[collapsible=icon]:hidden">バグ報告・機能要望</span>
              </Button>
            </SidebarMenuButton>
          </div>
        </div>
        
        <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
      </SidebarFooter>
    </Sidebar>
  );
}
