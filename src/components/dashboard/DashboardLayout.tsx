
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardHeader } from "./DashboardHeader"
import { DashboardSidebar } from "./DashboardSidebar"
import { useState, useEffect } from "react"
import { PersistentCosChat } from "./PersistentCosChat"
import { useAuth } from "@/contexts/AuthContext"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    console.log("DashboardLayout mounted with currentUser:", currentUser?.uid || "null");
  }, [currentUser]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar onToggleChat={() => setIsChatOpen(prev => !prev)} isChatOpen={isChatOpen} />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
        <PersistentCosChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    </SidebarProvider>
  )
}
