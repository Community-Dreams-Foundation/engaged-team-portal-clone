
import { 
  Bell,
  BellOff,
  Calendar,
  ClipboardList,
  Clock,
  CreditCard,
  MessageSquare,
  Moon,
  Shield,
  Star,
  Sun,
  User,
  Wrench,
  AlertTriangle,
  Check,
  Info,
  Timer,
} from "lucide-react";
import React from "react";

export interface NotificationPreference {
  enabled: boolean;
  channel: "in-app" | "email" | "both";
  frequency: "immediate" | "hourly" | "daily";
}

export type NotificationGroup = "system" | "leadership" | "productivity" | "meetings" | "financial";

export type GroupedPreferences = {
  [key in NotificationGroup]: {
    types: string[];
    label: string;
    icon: React.ReactNode;
    description: string;
  }
};

export interface NotificationSchedule {
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  weekendsOff: boolean;
  customDays: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
}

export const notificationGroups: GroupedPreferences = {
  system: {
    types: ["system"],
    label: "System",
    icon: <Wrench className="h-4 w-4" />,
    description: "Platform updates, maintenance notifications, and service announcements",
  },
  leadership: {
    types: ["leadership", "performance_update"],
    label: "Leadership",
    icon: <Shield className="h-4 w-4" />,
    description: "Leadership assessments, challenges, and tier updates",
  },
  productivity: {
    types: ["task_alert", "comment", "waiver"],
    label: "Tasks & Productivity",
    icon: <ClipboardList className="h-4 w-4" />,
    description: "Task assignments, deadlines, comments, and waiver notifications",
  },
  meetings: {
    types: ["meeting", "support"],
    label: "Meetings & Support",
    icon: <Calendar className="h-4 w-4" />,
    description: "Meeting reminders, recording availability, and support tickets",
  },
  financial: {
    types: ["fee_reminder", "payment"],
    label: "Financial",
    icon: <CreditCard className="h-4 w-4" />,
    description: "Fee reminders, payment confirmations, and financial updates",
  },
};

export const getNotificationIcon = (type: string, size = 4) => {
  switch (type) {
    case "meeting":
      return <Calendar className={`h-${size} w-${size}`} />;
    case "support":
      return <MessageSquare className={`h-${size} w-${size}`} />;
    case "task_alert":
      return <ClipboardList className={`h-${size} w-${size}`} />;
    case "fee_reminder":
      return <CreditCard className={`h-${size} w-${size}`} />;
    case "performance_update":
      return <Star className={`h-${size} w-${size}`} />;
    case "leadership":
      return <Shield className={`h-${size} w-${size}`} />;
    case "waiver":
      return <User className={`h-${size} w-${size}`} />;
    case "payment":
      return <CreditCard className={`h-${size} w-${size}`} />;
    case "comment":
      return <MessageSquare className={`h-${size} w-${size}`} />;
    case "system":
      return <Wrench className={`h-${size} w-${size}`} />;
    default:
      return <Bell className={`h-${size} w-${size}`} />;
  }
};

export const getNotificationColor = (type: string, priority?: string) => {
  if (priority === "high") return "bg-red-500";
  if (priority === "medium") return "bg-yellow-500";
  if (priority === "low") return "bg-green-500";
  
  switch (type) {
    case "fee_reminder":
    case "task_alert":
      return "bg-red-500";
    case "leadership":
    case "performance_update":
      return "bg-green-500";
    case "meeting":
      return "bg-blue-500";
    default:
      return "bg-primary";
  }
};
