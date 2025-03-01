
import { useAuth } from "@/contexts/AuthContext"
import { Link, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarHeaderTitle,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeaderAction,
} from "@/components/ui/sidebar"
import { 
  Kanban, 
  Users, 
  BarChart3, 
  BookOpen, 
  LifeBuoy, 
  Settings, 
  FileStack,
  Bot,
  LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function DashboardSidebar() {
  const { currentUser, signOut } = useAuth()
  const location = useLocation()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <Sidebar>
      <SidebarHeader className="h-14">
        <SidebarHeaderTitle>DreamStream</SidebarHeaderTitle>
        <SidebarHeaderAction asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </SidebarHeaderAction>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === "/dashboard"}
                  tooltip="Dashboard"
                >
                  <Link to="/dashboard">
                    <Kanban className="h-5 w-5" />
                    <span>Task Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Features</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === "/performance"}
                  tooltip="Performance"
                >
                  <Link to="/performance">
                    <BarChart3 className="h-5 w-5" />
                    <span>Performance</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === "/training"}
                  tooltip="Training"
                >
                  <Link to="/training">
                    <BookOpen className="h-5 w-5" />
                    <span>Training</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === "/community"}
                  tooltip="Community"
                >
                  <Link to="/community">
                    <Users className="h-5 w-5" />
                    <span>Community</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === "/portfolio"}
                  tooltip="Portfolio"
                >
                  <Link to="/portfolio">
                    <FileStack className="h-5 w-5" />
                    <span>Portfolio</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === "/cos-agent"}
                  tooltip="CoS Agent"
                >
                  <Link to="/cos-agent">
                    <Bot className="h-5 w-5" />
                    <span>CoS Agent</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === "/support"}
                  tooltip="Support"
                >
                  <Link to="/support">
                    <LifeBuoy className="h-5 w-5" />
                    <span>Support</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        {currentUser && (
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
