import { ReactNode, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { BottomNavigation } from "./BottomNavigation";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChatWidget } from "@/components/chat/ChatWidget";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border flex items-center justify-between px-4">
            <SidebarTrigger className="md:flex" />
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Bell className="h-5 w-5" />
            </Button>
          </header>
          <main className={`flex-1 p-4 md:p-6 overflow-auto ${isMobile ? 'pb-20' : ''}`}>
            {children}
          </main>
        </div>
        {isMobile && (
          <BottomNavigation onChatOpen={() => setChatOpen(true)} />
        )}
        <ChatWidget open={chatOpen} onOpenChange={setChatOpen} />
      </div>
    </SidebarProvider>
  );
}
