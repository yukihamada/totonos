import { Home, FileText, UserPlus, MessageCircle, Menu } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

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
  const location = useLocation();

  const handleMenuClick = () => {
    setOpenMobile(true);
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-background border-t border-border z-50 md:hidden safe-area-pb">
      <div className="flex items-center h-16">
        <BottomNavItem icon={Home} label="ホーム" to="/dashboard" />
        <BottomNavItem icon={FileText} label="請求書" to="/invoices" />
        <BottomNavItem icon={UserPlus} label="リード" to="/leads" />
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
