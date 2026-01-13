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
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
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

const mainNavItems = [
  { title: "ダッシュボード", url: "/dashboard", icon: LayoutDashboard },
];

const crmNavItems = [
  { title: "リード", url: "/leads", icon: UserPlus },
  { title: "商談", url: "/deals", icon: Target },
  { title: "取引先", url: "/clients", icon: Users },
];

const docNavItems = [
  { title: "請求書", url: "/invoices", icon: FileText },
  { title: "契約書", url: "/contracts", icon: FileSignature },
];

const financeNavItems = [
  { title: "自動消込", url: "/reconciliation", icon: ArrowLeftRight },
  { title: "Dynamic Boost", url: "/boost", icon: Zap },
  { title: "Trust Passport", url: "/trust-passport", icon: Shield },
];

const accountingNavItems = [
  { title: "会計ダッシュボード", url: "/accounting", icon: Calculator },
  { title: "仕訳帳", url: "/accounting/journal", icon: BookOpen },
  { title: "財務諸表", url: "/accounting/statements", icon: PieChart },
  { title: "固定資産", url: "/accounting/assets", icon: Building2 },
  { title: "経費管理", url: "/accounting/expenses", icon: Wallet },
];

const hrNavItems = [
  { title: "従業員", url: "/employees", icon: Users },
];

const infoNavItems = [
  { title: "社内Wiki", url: "/wiki", icon: Book },
  { title: "IT資産", url: "/it-assets", icon: Laptop },
];

const otherNavItems = [
  { title: "レポート", url: "/reports", icon: BarChart3 },
  { title: "設定", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { signOut, user } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center border-2 border-foreground bg-foreground text-background font-bold">
            I
          </div>
          {!collapsed && (
            <span className="text-xl font-bold tracking-tight">Invox</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>メイン</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className="flex items-center gap-2 hover:bg-accent"
                      activeClassName="bg-accent font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>営業・CRM</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {crmNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className="flex items-center gap-2 hover:bg-accent"
                      activeClassName="bg-accent font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>ドキュメント</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {docNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className="flex items-center gap-2 hover:bg-accent"
                      activeClassName="bg-accent font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>ファイナンス</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {financeNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className="flex items-center gap-2 hover:bg-accent"
                      activeClassName="bg-accent font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>会計</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountingNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className="flex items-center gap-2 hover:bg-accent"
                      activeClassName="bg-accent font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>人事・労務</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {hrNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className="flex items-center gap-2 hover:bg-accent"
                      activeClassName="bg-accent font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>情報管理</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {infoNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className="flex items-center gap-2 hover:bg-accent"
                      activeClassName="bg-accent font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>その他</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {otherNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className="flex items-center gap-2 hover:bg-accent"
                      activeClassName="bg-accent font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <div className="flex flex-col gap-2">
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
