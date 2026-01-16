import { ReactNode, useState, useEffect, useRef } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { BottomNavigation } from "./BottomNavigation";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FeedbackButton } from "@/components/FeedbackButton";
import { NotificationBell } from "@/components/NotificationBell";
import { CompanySetupDialog } from "@/components/CompanySetupDialog";
import { useCurrentCompany, useUpdateCompany, useEnsureDefaultCompany } from "@/hooks/useCompany";
import { useAuth } from "@/hooks/useAuth";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { GlobalSearch, GlobalSearchRef } from "@/components/GlobalSearch";

const SIDEBAR_STATE_KEY = "sidebar-open-state";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const [chatOpen, setChatOpen] = useState(false);
  const { user } = useAuth();
  const searchRef = useRef<GlobalSearchRef>(null);

  const { data: currentCompany, isLoading: companyLoading } = useCurrentCompany();
  const updateCompany = useUpdateCompany();
  const ensureDefaultCompany = useEnsureDefaultCompany();

  // Check if company needs setup (name is "会社名未登録")
  const needsCompanySetup = user && currentCompany && currentCompany.name === "会社名未登録";
  const [showSetupDialog, setShowSetupDialog] = useState(false);

  // Ensure user has a company when logged in
  useEffect(() => {
    if (user && !companyLoading && !currentCompany) {
      ensureDefaultCompany.mutate();
    }
  }, [user, companyLoading, currentCompany]);

  // Show setup dialog when company name is not set
  useEffect(() => {
    if (needsCompanySetup) {
      setShowSetupDialog(true);
    }
  }, [needsCompanySetup]);

  const handleCompanySetup = async (companyName: string, displayName?: string) => {
    if (!currentCompany) return;
    await updateCompany.mutateAsync({
      id: currentCompany.id,
      name: companyName,
      display_name: displayName || companyName,
    });
    setShowSetupDialog(false);
  };

  // Load sidebar state from localStorage
  const [sidebarDefaultOpen, setSidebarDefaultOpen] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_STATE_KEY);
    return saved !== null ? saved === "true" : true;
  });

  const handleSidebarOpenChange = (open: boolean) => {
    localStorage.setItem(SIDEBAR_STATE_KEY, String(open));
  };

  return (
    <SidebarProvider defaultOpen={sidebarDefaultOpen} onOpenChange={handleSidebarOpenChange}>
      <div className="min-h-screen flex w-full flex-col">
        {/* Keyboard Shortcuts */}
        <KeyboardShortcuts
          onOpenChat={() => setChatOpen(true)}
          onOpenSearch={() => searchRef.current?.open()}
        />
        
        <div className="flex flex-1">
          <AppSidebar onChatOpen={() => setChatOpen(true)} />
          <div className="flex-1 flex flex-col">
            <header className="h-14 border-b border-border flex items-center justify-between px-4">
              <SidebarTrigger className="md:flex" />
              <div className="flex items-center gap-2">
                <GlobalSearch ref={searchRef} />
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
                    <p>AIアシスタント</p>
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
