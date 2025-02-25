
import React, { createContext, useContext, useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { getDatabase, ref, onValue, push } from "firebase/database"
import { useAuth } from "@/contexts/AuthContext"

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "meeting" | "support" | "system";
  status: "unread" | "read";
  timestamp: number;
  metadata?: {
    meetingId?: string;
    supportTicketId?: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  markAsRead: (notificationId: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, "id" | "status" | "timestamp">) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { toast } = useToast()
  const { currentUser } = useAuth()

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
        setNotifications(notificationsList)
      }
    })

    return () => unsubscribe()
  }, [currentUser])

  const markAsRead = async (notificationId: string) => {
    if (!currentUser) return
    const db = getDatabase()
    await push(ref(db, `users/${currentUser.uid}/notifications/${notificationId}`), {
      status: "read"
    })
  }

  const addNotification = async (notification: Omit<Notification, "id" | "status" | "timestamp">) => {
    if (!currentUser) return
    const db = getDatabase()
    const newNotification = {
      ...notification,
      status: "unread",
      timestamp: Date.now()
    }
    
    const notificationRef = push(ref(db, `users/${currentUser.uid}/notifications`))
    await push(notificationRef, newNotification)

    toast({
      title: notification.title,
      description: notification.message,
    })
  }

  return (
    <NotificationContext.Provider value={{ notifications, markAsRead, addNotification }}>
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

