import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Bell, Mail, Clock, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getDatabase, ref, update, get } from "firebase/database"
import { useAuth } from "@/contexts/AuthContext"
import { Separator } from "@/components/ui/separator"

interface NotificationPreference {
  enabled: boolean;
  channel: "in-app" | "email" | "both";
  frequency: "immediate" | "hourly" | "daily";
}

type NotificationPreferences = Record<string, NotificationPreference>;

export default function NotificationSettings() {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [preferences, setPreferences] = useState<NotificationPreferences>({})
  const [isLoading, setIsLoading] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)
  const [errorLoading, setErrorLoading] = useState(false)

  useEffect(() => {
    async function loadPreferences() {
      if (!currentUser) {
        setIsLoading(false)
        return
      }
      
      try {
        setIsLoading(true)
        setErrorLoading(false)
        const db = getDatabase()
        const prefsRef = ref(db, `users/${currentUser.uid}/notificationPreferences`)
        const snapshot = await get(prefsRef)
        
        if (snapshot.exists()) {
          setPreferences(snapshot.val())
        } else {
          const defaultPreferences: NotificationPreferences = {
            meeting: {
              enabled: true,
              channel: "both",
              frequency: "immediate"
            },
            task_alert: {
              enabled: true,
              channel: "both",
              frequency: "immediate"
            },
            fee_reminder: {
              enabled: true,
              channel: "both",
              frequency: "immediate"
            },
            performance_update: {
              enabled: true,
              channel: "in-app",
              frequency: "daily"
            },
            leadership: {
              enabled: true,
              channel: "in-app",
              frequency: "daily"
            },
            support: {
              enabled: true,
              channel: "both",
              frequency: "immediate"
            },
            waiver: {
              enabled: true,
              channel: "both",
              frequency: "immediate"
            },
            training: {
              enabled: true,
              channel: "in-app",
              frequency: "daily"
            },
            system: {
              enabled: true,
              channel: "in-app",
              frequency: "immediate"
            }
          }
          setPreferences(defaultPreferences)
        }
      } catch (error) {
        console.error("Error loading notification preferences:", error)
        setErrorLoading(true)
        toast({
          variant: "destructive",
          title: "Failed to load notification preferences",
          description: "Please try again later"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadPreferences()
  }, [currentUser, toast])

  const handleToggleNotification = (type: string, enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        enabled
      }
    }))
    setHasChanges(true)
  }

  const handleChannelChange = (type: string, channel: "in-app" | "email" | "both") => {
    setPreferences(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        channel
      }
    }))
    setHasChanges(true)
  }

  const handleFrequencyChange = (type: string, frequency: "immediate" | "hourly" | "daily") => {
    setPreferences(prev => ({
      ...prev, 
      [type]: {
        ...prev[type],
        frequency
      }
    }))
    setHasChanges(true)
  }

  const savePreferences = async () => {
    if (!currentUser) return
    
    try {
      const db = getDatabase()
      const prefsRef = ref(db, `users/${currentUser.uid}/notificationPreferences`)
      await update(prefsRef, preferences)
      
      toast({
        title: "Preferences saved",
        description: "Your notification preferences have been updated"
      })
      setHasChanges(false)
    } catch (error) {
      console.error("Error saving notification preferences:", error)
      toast({
        variant: "destructive",
        title: "Failed to save preferences",
        description: "Please try again"
      })
    }
  }

  const handleResetToDefault = () => {
    const defaultPreferences: NotificationPreferences = {
      meeting: {
        enabled: true,
        channel: "both",
        frequency: "immediate"
      },
      task_alert: {
        enabled: true,
        channel: "both",
        frequency: "immediate"
      },
      fee_reminder: {
        enabled: true,
        channel: "both",
        frequency: "immediate"
      },
      performance_update: {
        enabled: true,
        channel: "in-app",
        frequency: "daily"
      },
      leadership: {
        enabled: true,
        channel: "in-app",
        frequency: "daily"
      },
      support: {
        enabled: true,
        channel: "both",
        frequency: "immediate"
      },
      waiver: {
        enabled: true,
        channel: "both",
        frequency: "immediate"
      },
      training: {
        enabled: true,
        channel: "in-app",
        frequency: "daily"
      },
      system: {
        enabled: true,
        channel: "in-app",
        frequency: "immediate"
      }
    }
    setPreferences(defaultPreferences)
    setHasChanges(true)
  }

  const getNotificationTitle = (type: string): string => {
    switch (type) {
      case "meeting": return "Meeting Updates"
      case "support": return "Support Messages"
      case "task_alert": return "Task Alerts"
      case "fee_reminder": return "Fee Reminders"
      case "performance_update": return "Performance Updates"
      case "leadership": return "Leadership Opportunities"
      case "waiver": return "Waiver Status Changes"
      case "training": return "Training Modules"
      case "system": return "System Notifications"
      default: return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  const getNotificationDescription = (type: string): string => {
    switch (type) {
      case "meeting": 
        return "Get notified about meeting invites, changes, reminders, and recordings."
      case "support": 
        return "Receive notifications when you get a response to your support tickets."
      case "task_alert": 
        return "Be alerted when tasks are assigned to you or approaching deadlines."
      case "fee_reminder": 
        return "Stay updated on payment due dates and fee changes."
      case "performance_update": 
        return "Receive updates about your performance metrics and improvements."
      case "leadership": 
        return "Get notified about leadership opportunities and recognition."
      case "waiver": 
        return "Get updates on your waiver application status and requests."
      case "training": 
        return "Stay informed about new training modules and educational content."
      case "system": 
        return "Receive important system announcements and updates."
      default: 
        return "Notifications related to your account activities."
    }
  }

  const getNotificationImportance = (type: string): "low" | "medium" | "high" => {
    switch (type) {
      case "fee_reminder":
      case "task_alert":
      case "waiver":
        return "high"
      case "meeting":
      case "support":
      case "system":
        return "medium"
      default:
        return "low"
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Loading your notification settings...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between space-x-2 rounded-lg border p-4 animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted rounded"></div>
                  <div className="h-3 w-48 bg-muted rounded"></div>
                </div>
                <div className="h-6 w-12 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (errorLoading) {
    return (
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>There was an error loading your notification settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <p className="text-center text-muted-foreground">
              We couldn't load your notification preferences. Please try refreshing the page.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentUser) {
    return (
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Sign in to manage your notification settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <Bell className="h-12 w-12 text-muted" />
            <p className="text-center text-muted-foreground">
              You need to be signed in to view and manage your notification preferences.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Control how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(preferences).map(([type, preference]) => {
          const importance = getNotificationImportance(type)
          
          return (
            <div key={type} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-medium">{getNotificationTitle(type)}</h3>
                    <Badge
                      variant={
                        importance === "high" ? "destructive" :
                        importance === "medium" ? "secondary" :
                        "outline"
                      }
                    >
                      {importance}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getNotificationDescription(type)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`enable-${type}`}
                    checked={preference.enabled}
                    onCheckedChange={(checked) => handleToggleNotification(type, checked)}
                  />
                  <Label htmlFor={`enable-${type}`} className="sr-only">
                    Enable {getNotificationTitle(type)}
                  </Label>
                </div>
              </div>
              
              {preference.enabled && (
                <div className="ml-6 grid md:grid-cols-2 gap-6 pl-4 border-l-2 border-muted">
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <Bell className="h-4 w-4" />
                      <span>Delivery Method</span>
                    </Label>
                    <RadioGroup 
                      value={preference.channel} 
                      onValueChange={(value) => handleChannelChange(type, value as "in-app" | "email" | "both")}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="in-app" id={`channel-in-app-${type}`} />
                        <Label htmlFor={`channel-in-app-${type}`} className="flex items-center space-x-2 text-sm cursor-pointer">
                          <Bell className="h-4 w-4" />
                          <span>In-app only</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id={`channel-email-${type}`} />
                        <Label htmlFor={`channel-email-${type}`} className="flex items-center space-x-2 text-sm cursor-pointer">
                          <Mail className="h-4 w-4" />
                          <span>Email only</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="both" id={`channel-both-${type}`} />
                        <Label htmlFor={`channel-both-${type}`} className="flex items-center space-x-2 text-sm cursor-pointer">
                          <span>Both in-app and email</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Notification Frequency</span>
                    </Label>
                    <Select 
                      value={preference.frequency} 
                      onValueChange={(value) => handleFrequencyChange(type, value as "immediate" | "hourly" | "daily")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="hourly">Hourly digest</SelectItem>
                        <SelectItem value="daily">Daily digest</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {preference.frequency === "immediate" 
                        ? "Get notified as soon as events happen" 
                        : preference.frequency === "hourly"
                        ? "Receive an hourly summary of all notifications" 
                        : "Receive a daily digest of all notifications"}
                    </p>
                  </div>
                </div>
              )}
              <Separator />
            </div>
          )
        })}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 bg-muted/10 py-4">
        <Button variant="outline" onClick={handleResetToDefault} disabled={!hasChanges}>
          Reset to Default
        </Button>
        <Button disabled={!hasChanges} onClick={savePreferences}>
          <Save className="mr-2 h-4 w-4" />
          Save Preferences
        </Button>
      </CardFooter>
    </Card>
  )
}
