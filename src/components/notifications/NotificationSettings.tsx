import { useState, useEffect } from "react";
import { useNotifications, Notification } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { getDatabase, ref, update, get } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimePickerDemo } from "@/components/ui/time-picker";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { z } from "zod";
import { SettingsCard } from "@/components/settings/SettingsCard";
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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface NotificationPreference {
  enabled: boolean;
  channel: "in-app" | "email" | "both";
  frequency: "immediate" | "hourly" | "daily";
}

type NotificationGroup = "system" | "leadership" | "productivity" | "meetings" | "financial";

type GroupedPreferences = {
  [key in NotificationGroup]: {
    types: string[];
    label: string;
    icon: React.ReactNode;
    description: string;
  }
};

interface NotificationSchedule {
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

const defaultSchedule: NotificationSchedule = {
  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",
  weekendsOff: false,
  customDays: {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
  },
};

const notificationGroups: GroupedPreferences = {
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

const notificationSchema = z.object({
  schedule: z.object({
    quietHoursEnabled: z.boolean(),
    quietHoursStart: z.string(),
    quietHoursEnd: z.string(),
    weekendsOff: z.boolean(),
    customDays: z.object({
      monday: z.boolean(),
      tuesday: z.boolean(),
      wednesday: z.boolean(),
      thursday: z.boolean(),
      friday: z.boolean(),
      saturday: z.boolean(),
      sunday: z.boolean(),
    }),
  }),
});

const getNotificationIcon = (type: string, size = 4) => {
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

const getNotificationColor = (type: string, priority?: string) => {
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

const getExampleNotification = (type: string): Notification => {
  const baseNotification = {
    id: `example-${type}`,
    status: "unread" as const,
    timestamp: Date.now(),
  };

  switch (type) {
    case "meeting":
      return {
        ...baseNotification,
        title: "Meeting Reminder",
        message: "Weekly Sync starts in 15 minutes",
        type: "meeting",
        metadata: {
          meetingId: "123",
          priority: "medium" as const,
          actionRequired: true,
          action: {
            type: "join_meeting",
            link: "/meetings/123",
          },
        },
      };
    case "task_alert":
      return {
        ...baseNotification,
        title: "Task Due Soon",
        message: "Project milestone due in 2 days",
        type: "task_alert",
        metadata: {
          taskId: "456",
          priority: "high" as const,
          actionRequired: true,
        },
      };
    case "leadership":
      return {
        ...baseNotification,
        title: "Leadership Challenge",
        message: "New team leadership challenge available",
        type: "leadership",
        metadata: {
          priority: "medium" as const,
        },
      };
    case "fee_reminder":
      return {
        ...baseNotification,
        title: "Payment Due",
        message: "Monthly subscription payment due in 3 days",
        type: "fee_reminder",
        metadata: {
          amount: 199,
          dueDate: "2023-06-15",
          priority: "high" as const,
        },
      };
    case "system":
      return {
        ...baseNotification,
        title: "System Update",
        message: "Platform updates scheduled for tonight at 2AM",
        type: "system",
        metadata: {
          priority: "low" as const,
        },
      };
    default:
      return {
        ...baseNotification,
        title: "Notification Example",
        message: `This is an example ${type} notification`,
        type: type as any,
        metadata: {
          priority: "medium" as const,
        },
      };
  }
};

function NotificationPreferenceItem({
  type,
  preference,
  onUpdate,
}: {
  type: string;
  preference: NotificationPreference;
  onUpdate: (type: string, field: keyof NotificationPreference, value: any) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-2">
        {getNotificationIcon(type)}
        <span className="capitalize font-medium">
          {type.replace(/_/g, " ")}
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            id={`${type}-enabled`}
            checked={preference.enabled}
            onCheckedChange={(checked) => onUpdate(type, "enabled", checked)}
          />
          <Label htmlFor={`${type}-enabled`}>Enabled</Label>
        </div>

        <Select
          value={preference.channel}
          onValueChange={(value) =>
            onUpdate(type, "channel", value as "in-app" | "email" | "both")
          }
          disabled={!preference.enabled}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in-app">In-app Only</SelectItem>
            <SelectItem value="email">Email Only</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={preference.frequency}
          onValueChange={(value) =>
            onUpdate(
              type,
              "frequency",
              value as "immediate" | "hourly" | "daily"
            )
          }
          disabled={!preference.enabled || preference.channel === "in-app"}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="immediate">Immediate</SelectItem>
            <SelectItem value="hourly">Hourly Digest</SelectItem>
            <SelectItem value="daily">Daily Digest</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function NotificationExample({ type }: { type: string }) {
  const exampleNotification = getExampleNotification(type);

  return (
    <div className="relative rounded-lg border p-4 my-2 hover:bg-accent/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${getNotificationColor(type, exampleNotification.metadata?.priority)} text-white`}>
          {getNotificationIcon(type, 5)}
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">{exampleNotification.title}</h4>
            <Badge variant={
              exampleNotification.metadata?.priority === "high" ? "destructive" :
              exampleNotification.metadata?.priority === "medium" ? "default" :
              "outline"
            }>
              {exampleNotification.metadata?.priority || "normal"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{exampleNotification.message}</p>
          {exampleNotification.metadata?.actionRequired && (
            <Badge variant="outline" className="mt-1">Action Required</Badge>
          )}
        </div>
      </div>
    </div>
  )
}

export default function NotificationSettings() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<
    Record<string, NotificationPreference>
  >({});
  const [schedule, setSchedule] = useState<NotificationSchedule>(defaultSchedule);
  const [activeTab, setActiveTab] = useState("categories");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const loadPreferences = async () => {
      try {
        const db = getDatabase();
        const prefsRef = ref(db, `users/${currentUser.uid}/notificationPreferences`);
        const scheduleRef = ref(db, `users/${currentUser.uid}/notificationSchedule`);
        
        const [prefsSnapshot, scheduleSnapshot] = await Promise.all([
          get(prefsRef),
          get(scheduleRef)
        ]);

        if (prefsSnapshot.exists()) {
          setPreferences(prefsSnapshot.val());
        } else {
          // Set default preferences
          const defaults: Record<string, NotificationPreference> = {};
          Object.values(notificationGroups).forEach(group => {
            group.types.forEach(type => {
              defaults[type] = {
                enabled: true,
                channel: "both",
                frequency: "immediate",
              };
            });
          });
          setPreferences(defaults);
        }
        
        if (scheduleSnapshot.exists()) {
          setSchedule(scheduleSnapshot.val());
        }
      } catch (error) {
        console.error("Error loading notification preferences:", error);
        toast({
          title: "Error",
          description: "Failed to load notification preferences",
          variant: "destructive",
        });
      }
    };

    loadPreferences();
  }, [currentUser, toast]);

  const handleUpdatePreference = (
    type: string,
    field: keyof NotificationPreference,
    value: any
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const handleSavePreferences = async () => {
    if (!currentUser) return;
    
    setSaving(true);
    try {
      const db = getDatabase();
      await update(ref(db, `users/${currentUser.uid}`), {
        notificationPreferences: preferences,
      });
      
      toast({
        title: "Preferences Saved",
        description: "Your notification preferences have been updated",
        variant: "success",
      });
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save notification preferences",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleSaveSchedule = async (values: z.infer<typeof notificationSchema>) => {
    if (!currentUser) return;
    
    try {
      const db = getDatabase();
      await update(ref(db, `users/${currentUser.uid}`), {
        notificationSchedule: values.schedule,
      });
      
      setSchedule(values.schedule);
      
      toast({
        title: "Schedule Saved",
        description: "Your notification schedule has been updated",
        variant: "success",
      });
    } catch (error) {
      console.error("Error saving notification schedule:", error);
      toast({
        title: "Error",
        description: "Failed to save notification schedule",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Fix: Update the updateSchedule function to ensure all required properties are included
  const updateSchedule = (updates: Partial<NotificationSchedule>) => {
    // Ensure we're creating a complete NotificationSchedule object by spread
    // first the defaultSchedule (for type safety), then the current schedule,
    // and finally apply the updates
    setSchedule(prevSchedule => {
      // Handle the special case for customDays to ensure it's always complete
      const updatedCustomDays = updates.customDays 
        ? { ...prevSchedule.customDays, ...updates.customDays }
        : prevSchedule.customDays;
        
      // Return a complete NotificationSchedule object
      return {
        ...prevSchedule,
        ...updates,
        // Always ensure customDays is complete even if updates.customDays is partial
        customDays: updatedCustomDays
      };
    });
  };

  const hasPreferences = Object.keys(preferences).length > 0;

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold">Notification Settings</h2>
        <p className="text-muted-foreground">
          Manage how and when you receive notifications
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="examples">Notification Examples</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories" className="mt-6">
          <SettingsCard
            title="Notification Categories"
            description="Configure which notifications you want to receive and how you want to receive them."
            footer={
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSavePreferences}
                  disabled={saving}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
                >
                  {saving ? <span className="animate-spin">•</span> : <Bell className="h-4 w-4" />}
                  Save Preferences
                </button>
              </div>
            }
          >
            {hasPreferences ? (
              <div className="space-y-6">
                {Object.entries(notificationGroups).map(([groupKey, group]) => (
                  <div key={groupKey} className="space-y-4">
                    <div className="flex items-center gap-2">
                      {group.icon}
                      <h3 className="text-lg font-medium">{group.label}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{group.description}</p>
                    <div className="space-y-1 border rounded-lg p-4">
                      {group.types.map((type) => (
                        <NotificationPreferenceItem
                          key={type}
                          type={type}
                          preference={
                            preferences[type] || {
                              enabled: true,
                              channel: "both",
                              frequency: "immediate",
                            }
                          }
                          onUpdate={handleUpdatePreference}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Preferences Set</h3>
                <p className="text-muted-foreground">
                  Loading your notification preferences...
                </p>
              </div>
            )}
          </SettingsCard>
        </TabsContent>
        
        <TabsContent value="schedule" className="mt-6">
          <SettingsForm
            schema={notificationSchema}
            defaultValues={{
              schedule: schedule,
            }}
            onSubmit={handleSaveSchedule}
          >
            <SettingsCard
              title="Do Not Disturb Schedule"
              description="Set quiet hours and days when you don't want to receive notifications."
            >
              <div className="space-y-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="quiet-hours"
                      checked={schedule.quietHoursEnabled}
                      onCheckedChange={(checked) => updateSchedule({ quietHoursEnabled: checked })}
                    />
                    <Label htmlFor="quiet-hours">Enable Quiet Hours</Label>
                  </div>
                  
                  {schedule.quietHoursEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="start-time">Start Time</Label>
                        <div className="flex items-center space-x-2">
                          <Moon className="h-4 w-4 text-muted-foreground" />
                          <input
                            id="start-time"
                            type="time"
                            value={schedule.quietHoursStart}
                            onChange={(e) => updateSchedule({ quietHoursStart: e.target.value })}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end-time">End Time</Label>
                        <div className="flex items-center space-x-2">
                          <Sun className="h-4 w-4 text-muted-foreground" />
                          <input
                            id="end-time"
                            type="time"
                            value={schedule.quietHoursEnd}
                            onChange={(e) => updateSchedule({ quietHoursEnd: e.target.value })}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="weekends-off"
                      checked={schedule.weekendsOff}
                      onCheckedChange={(checked) => updateSchedule({ 
                        weekendsOff: checked,
                        customDays: {
                          saturday: !checked,
                          sunday: !checked
                        }
                      })}
                    />
                    <Label htmlFor="weekends-off">Disable weekend notifications</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Custom Days</Label>
                    <div className="grid grid-cols-7 gap-2">
                      {Object.entries({
                        monday: "M",
                        tuesday: "T",
                        wednesday: "W",
                        thursday: "T",
                        friday: "F",
                        saturday: "S",
                        sunday: "S"
                      }).map(([day, label]) => {
                        const isWeekend = day === "saturday" || day === "sunday";
                        const disabled = isWeekend && schedule.weekendsOff;
                        
                        return (
                          <div key={day} className="text-center">
                            <button
                              type="button"
                              disabled={disabled}
                              className={`w-10 h-10 rounded-full ${
                                schedule.customDays[day as keyof typeof schedule.customDays] && !disabled
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary text-secondary-foreground"
                              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                              onClick={() => {
                                if (!disabled) {
                                  updateSchedule({
                                    customDays: {
                                      [day]: !schedule.customDays[day as keyof typeof schedule.customDays]
                                    }
                                  });
                                }
                              }}
                            >
                              {label}
                            </button>
                            <span className="text-xs block mt-1 capitalize">{day.slice(0, 3)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Notification Schedule</AlertTitle>
                  <AlertDescription>
                    During quiet hours and on disabled days, you will not receive push or email notifications. 
                    In-app notifications will still be collected and available when you log in.
                  </AlertDescription>
                </Alert>
              </div>
            </SettingsCard>
          </SettingsForm>
        </TabsContent>
        
        <TabsContent value="examples" className="mt-6">
          <SettingsCard
            title="Notification Examples"
            description="Preview how different types of notifications will appear in the app."
          >
            <div className="grid grid-cols-1 gap-6">
              {Object.entries(notificationGroups).map(([groupKey, group]) => (
                <div key={groupKey} className="space-y-4">
                  <div className="flex items-center gap-2">
                    {group.icon}
                    <h3 className="text-lg font-medium">{group.label}</h3>
                  </div>
                  <div className="border rounded-lg p-4 space-y-4">
                    {group.types.map((type) => (
                      <NotificationExample key={type} type={type} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SettingsCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
