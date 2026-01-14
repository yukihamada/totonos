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
};

export function AppSidebar() {
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
              I
            </div>
            {!collapsed && (
              <span className="text-xl font-bold tracking-tight">Invox</span>
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
