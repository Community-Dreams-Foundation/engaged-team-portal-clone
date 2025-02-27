
import React, { createContext, useContext, useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { getDatabase, ref, onValue, update, push, get } from "firebase/database"
import { useAuth } from "@/contexts/AuthContext"

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "meeting" | "support" | "system" | "task_alert" | "fee_reminder" | "performance_update" | "waiver" | "payment" | "comment";
  status: "unread" | "read";
  timestamp: number;
  metadata?: {
    meetingId?: string;
    supportTicketId?: string;
    taskId?: string;
    commentId?: string;
    waiverId?: string;
    paymentId?: string;
    amount?: number;
    dueDate?: string;
    priority?: "low" | "medium" | "high";
    actionRequired?: boolean;
    action?: {
      type: string;
      link?: string;
    };
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  filteredNotifications: (types: string[]) => Notification[];
  markAsRead: (notificationId: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, "id" | "status" | "timestamp">) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { toast } = useToast()
  const { currentUser } = useAuth()

  const unreadCount = notifications.filter(n => n.status === "unread").length

  useEffect(() => {
    if (!currentUser) return

    const db = getDatabase()
    const notificationsRef = ref(db, `users/${currentUser.uid}/notifications`)

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        const notificationsList = Object.entries(data).map(([id, value]) => ({
          id,
          ...value as Omit<Notification, "id">
        }))
        notificationsList.sort((a, b) => b.timestamp - a.timestamp)
        setNotifications(notificationsList)
      } else {
        setNotifications([])
      }
    })

    return () => unsubscribe()
  }, [currentUser])

  const markAsRead = async (notificationId: string) => {
    if (!currentUser) return
    const db = getDatabase()
    return update(ref(db, `users/${currentUser.uid}/notifications/${notificationId}`), {
      status: "read",
    })
  }

  const markAllAsRead = async () => {
    if (!currentUser || notifications.length === 0) return
    const db = getDatabase()
    const updates: Record<string, any> = {}
    
    notifications.forEach(notification => {
      if (notification.status === "unread") {
        updates[`users/${currentUser.uid}/notifications/${notification.id}/status`] = "read"
      }
    })
    
    return update(ref(db), updates)
  }

  const deleteNotification = async (notificationId: string) => {
    if (!currentUser) return
    const db = getDatabase()
    return update(ref(db, `users/${currentUser.uid}/notifications/${notificationId}`), null)
  }

  const addNotification = async (notification: Omit<Notification, "id" | "status" | "timestamp">) => {
    if (!currentUser) return
    const db = getDatabase()
    const notificationsRef = ref(db, `users/${currentUser.uid}/notifications`)
    
    const newNotification = {
      ...notification,
      status: "unread",
      timestamp: Date.now()
    }
    
    await push(notificationsRef, newNotification)

    toast({
      title: notification.title,
      description: notification.message,
    })
  }

  const filteredNotifications = (types: string[]) => {
    return notifications.filter(notification => types.includes(notification.type))
  }

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        filteredNotifications,
        markAsRead, 
        addNotification, 
        markAllAsRead, 
        deleteNotification 
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
