
import { 
  ChartBar, 
  CalendarClock, 
  Settings, 
  UserCircle, 
  Users, 
  BrainCircuit, 
  FileBox, 
  MessageSquare, 
  BadgeDollarSign,
  BarChart3,
  Lightbulb,
  Home
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useNavigate, useLocation } from "react-router-dom"

export function DashboardSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: FileBox, label: "Tasks", href: "/tasks" },
    { icon: BrainCircuit, label: "Training", href: "/training" },
    { icon: BarChart3, label: "Performance", href: "/performance" },
    { icon: Users, label: "Community", href: "/community" },
    { icon: MessageSquare, label: "Communication", href: "/communication" },
    { icon: CalendarClock, label: "Meetings", href: "/meetings" },
    { icon: BadgeDollarSign, label: "Fees", href: "/fees" },
    { icon: Lightbulb, label: "Submit Idea", href: "/submit-idea" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ]

  const isActive = (href: string) => {
    return location.pathname === href
  }

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-4 mb-4">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/cc37c25a-85ca-4af3-a844-a7f5a90aea97.png" 
              alt="DreamStream Logo" 
              className="h-10 w-10" 
            />
            <div className="font-semibold text-lg text-primary">DreamStream</div>
          </div>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton 
                    className={isActive(item.href) ? "bg-primary/10 text-primary" : ""}
                    onClick={() => navigate(item.href)}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
