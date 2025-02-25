
import { Search, Bell, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NotificationsDropdown } from "@/components/notifications/NotificationsDropdown"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4">
        <SidebarTrigger />
        <div className="flex-1 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/lovable-uploads/cc37c25a-85ca-4af3-a844-a7f5a90aea97.png"
              alt="DreamStream Logo"
              className="h-8 w-8"
            />
            <div className="hidden sm:flex flex-col">
              <span className="font-semibold">DreamStream</span>
              <span className="text-xs text-muted-foreground">One Team, One Dream</span>
            </div>
          </div>
          <div className="hidden md:flex flex-1 items-center gap-4 mx-4">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tasks, documentation, and knowledge base..."
                className="pl-8"
              />
            </div>
          </div>
        </div>
        <NotificationsDropdown />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
