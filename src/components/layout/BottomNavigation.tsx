import { 
  Home, FileText, UserPlus, MessageCircle, Menu, Target, Users, 
  ClipboardList, FileSignature, Wallet, FolderKanban, Book, 
  Calculator, Package, Clock, BarChart3, Bell, UserCircle, Settings,
  LucideIcon
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { useAppSettings } from "@/contexts/SettingsContext";

// Icon mapping for mobile nav
const mobileIconMap: Record<string, LucideIcon> = {
  dashboard: Home,
  invoices: FileText,
  leads: UserPlus,
  deals: Target,
  clients: Users,
  estimates: ClipboardList,
  contracts: FileSignature,
  expenses: Wallet,
  employees: Users,
  projects: FolderKanban,
  wiki: Book,
  accounting: Calculator,
  products: Package,
  attendance: Clock,
  reports: BarChart3,
  notifications: Bell,
  profile: UserCircle,
  settings: Settings,
};

// URL mapping for mobile nav
const mobileUrlMap: Record<string, string> = {
  dashboard: '/dashboard',
  invoices: '/invoices',
  leads: '/leads',
  deals: '/deals',
  clients: '/clients',
  estimates: '/estimates',
  contracts: '/contracts',
  expenses: '/expenses',
  employees: '/employees',
  projects: '/projects',
  wiki: '/wiki',
  accounting: '/accounting',
  products: '/products',
  attendance: '/attendance',
  reports: '/reports',
  notifications: '/notifications',
  profile: '/profile',
  settings: '/settings',
};

// Label mapping for mobile nav
const mobileLabelMap: Record<string, string> = {
  dashboard: 'ホーム',
  invoices: '請求書',
  leads: 'リード',
  deals: '商談',
  clients: '取引先',
  estimates: '見積書',
  contracts: '契約書',
  expenses: '経費',
  employees: '従業員',
  projects: 'プロジェクト',
  wiki: 'Wiki',
  accounting: '会計',
  products: '商品',
  attendance: '勤怠',
  reports: 'レポート',
  notifications: '通知',
  profile: 'プロフィール',
  settings: '設定',
};

interface BottomNavItemProps {
  icon: React.ElementType;
  label: string;
  to?: string;
  onClick?: () => void;
  isActive?: boolean;
}

function BottomNavItem({ icon: Icon, label, to, onClick, isActive }: BottomNavItemProps) {
  const baseClasses = cn(
    "flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors",
    "text-muted-foreground hover:text-foreground",
    isActive && "text-primary"
  );

  if (to) {
    return (
      <NavLink 
        to={to} 
        className={({ isActive }) => cn(baseClasses, isActive && "text-primary")}
      >
        <Icon className="h-5 w-5" />
        <span className="text-[10px] font-medium">{label}</span>
      </NavLink>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses}>
      <Icon className="h-5 w-5" />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

interface BottomNavigationProps {
  onChatOpen?: () => void;
}

export function BottomNavigation({ onChatOpen }: BottomNavigationProps) {
  const { setOpenMobile } = useSidebar();
  const { settings } = useAppSettings();
  const location = useLocation();

  const handleMenuClick = () => {
    setOpenMobile(true);
  };

  // Get visible mobile nav items sorted by order
  const visibleNavItems = settings.mobileNavItems
    .filter(item => item.visible)
    .sort((a, b) => a.order - b.order)
    .slice(0, 3); // Maximum 3 items (plus chat and menu)

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-background border-t border-border z-50 md:hidden safe-area-pb">
      <div className="flex items-center h-16">
        {visibleNavItems.map(item => {
          const Icon = mobileIconMap[item.id] || Home;
          const url = mobileUrlMap[item.id] || '/dashboard';
          const label = mobileLabelMap[item.id] || item.id;
          
          return (
            <BottomNavItem 
              key={item.id}
              icon={Icon} 
              label={label} 
              to={url} 
            />
          );
        })}
        <BottomNavItem 
          icon={MessageCircle} 
          label="チャット" 
          onClick={onChatOpen}
        />
        <BottomNavItem 
          icon={Menu} 
          label="メニュー" 
          onClick={handleMenuClick}
        />
      </div>
    </nav>
  );
}
