
import { useNotifications } from "@/contexts/NotificationContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Bell, Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

export function NotificationsDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications()

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "meeting":
        return "🗓️"
      case "support":
        return "💬"
      case "task_alert":
        return "📋"
      case "fee_reminder":
        return "💰"
      case "performance_update":
        return "📈"
      default:
        return "ℹ️"
    }
  }

  const handleNotificationClick = async (notification: any) => {
    if (notification.status === "unread") {
      await markAsRead(notification.id)
    }
    if (notification.metadata?.action?.link) {
      window.location.href = notification.metadata.action.link
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4">
          <div className="text-sm font-medium">Notifications</div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => markAllAsRead()}
            >
              <Check className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="p-4 focus:bg-accent cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-4 items-start">
                  <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium leading-none ${
                        notification.status === "unread" ? "text-primary" : ""
                      }`}>
                        {notification.title}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDistanceToNow(notification.timestamp, { addSuffix: true })}</span>
                      {notification.metadata?.priority && (
                        <Badge variant={
                          notification.metadata.priority === "high" ? "destructive" :
                          notification.metadata.priority === "medium" ? "secondary" :
                          "outline"
                        }>
                          {notification.metadata.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
