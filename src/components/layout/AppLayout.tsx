import { ReactNode, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { BottomNavigation } from "./BottomNavigation";
import { MessageCircle, X, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDemo } from "@/contexts/DemoContext";
import { FeedbackButton } from "@/components/FeedbackButton";
import { NotificationBell } from "@/components/NotificationBell";
import { CompanySetupDialog } from "@/components/CompanySetupDialog";
import { useCurrentCompany, useUpdateCompany, useEnsureDefaultCompany } from "@/hooks/useCompany";
import { useAuth } from "@/hooks/useAuth";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const [chatOpen, setChatOpen] = useState(false);
  const { isDemoMode, exitDemoMode } = useDemo();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: currentCompany, isLoading: companyLoading } = useCurrentCompany();
  const updateCompany = useUpdateCompany();
  const ensureDefaultCompany = useEnsureDefaultCompany();

  // Check if company needs setup (name is "会社名未登録")
  const needsCompanySetup = !isDemoMode && user && currentCompany && currentCompany.name === "会社名未登録";
  const [showSetupDialog, setShowSetupDialog] = useState(false);

  // Ensure user has a company when logged in
  useEffect(() => {
    if (!isDemoMode && user && !companyLoading && !currentCompany) {
      ensureDefaultCompany.mutate();
    }
  }, [isDemoMode, user, companyLoading, currentCompany]);

  // Show setup dialog when company name is not set
  useEffect(() => {
    if (needsCompanySetup) {
      setShowSetupDialog(true);
    }
  }, [needsCompanySetup]);

  // Keyboard shortcut: Cmd+K or Ctrl+K to open chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setChatOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleExitDemo = () => {
    exitDemoMode();
    navigate("/");
  };

  const handleCompanySetup = async (companyName: string, displayName?: string) => {
    if (!currentCompany) return;
    await updateCompany.mutateAsync({
      id: currentCompany.id,
      name: companyName,
      display_name: displayName || companyName,
    });
    setShowSetupDialog(false);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full flex-col">
        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="bg-amber-500 text-amber-950 px-4 py-2 text-center text-sm flex items-center justify-center gap-2 flex-wrap">
            <span className="font-medium">🎮 デモモード</span>
            <span className="hidden sm:inline">- サンプルデータを表示中です</span>
            <div className="flex items-center gap-2 ml-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-amber-950 hover:bg-amber-400 hover:text-amber-950"
                onClick={handleExitDemo}
              >
                <X className="h-3 w-3 mr-1" />
                終了
              </Button>
              <Link to="/auth">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-amber-950 hover:bg-amber-400 hover:text-amber-950"
                  onClick={() => exitDemoMode()}
                >
                  <LogIn className="h-3 w-3 mr-1" />
                  アカウント作成
                </Button>
              </Link>
            </div>
          </div>
        )}
        
        <div className="flex flex-1">
          <AppSidebar onChatOpen={() => setChatOpen(true)} />
          <div className="flex-1 flex flex-col">
            <header className="h-14 border-b border-border flex items-center justify-between px-4">
              <SidebarTrigger className="md:flex" />
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10"
                      onClick={() => setChatOpen(true)}
                    >
                      <MessageCircle className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>AIアシスタント <kbd className="ml-1 text-xs bg-muted px-1 rounded">⌘K</kbd></p>
                  </TooltipContent>
                </Tooltip>
                <NotificationBell />
              </div>
            </header>
            <main className={`flex-1 p-4 md:p-6 overflow-auto ${isMobile ? 'pb-20' : ''}`}>
              {children}
            </main>
          </div>
        </div>
        {isMobile && (
          <BottomNavigation onChatOpen={() => setChatOpen(true)} />
        )}
        <ChatWidget open={chatOpen} onOpenChange={setChatOpen} />
        <FeedbackButton />
        
        {/* Company Setup Dialog */}
        <CompanySetupDialog
          open={showSetupDialog}
          onComplete={handleCompanySetup}
          isLoading={updateCompany.isPending}
        />
      </div>
    </SidebarProvider>
  );
}
