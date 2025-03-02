
import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useNotifications } from "@/contexts/NotificationContext"
import { getDatabase, ref, get, set } from "firebase/database"
import { useAuth } from "@/contexts/AuthContext"

interface NotificationPreference {
  type: string;
  displayName: string;
  description: string;
  enabled: boolean;
  channel: "in-app" | "email" | "both";
  frequency: "immediate" | "hourly" | "daily";
}

export function NotificationSettings() {
  const { toast } = useToast()
  const { currentUser } = useAuth()
  const { getNotificationsByType } = useNotifications()
  
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      type: "meeting",
      displayName: "Meeting Notifications",
      description: "Updates about scheduled meetings, reminders and recordings",
      enabled: true,
      channel: "both",
      frequency: "immediate"
    },
    {
      type: "task_alert",
      displayName: "Task Alerts",
      description: "Notifications about task assignments and deadlines",
      enabled: true,
      channel: "in-app",
      frequency: "immediate"
    },
    {
      type: "performance_update",
      displayName: "Performance Updates",
      description: "Updates about your performance metrics and evaluations",
      enabled: true,
      channel: "in-app",
      frequency: "daily"
    },
    {
      type: "leadership",
      displayName: "Leadership Updates",
      description: "Leadership level changes and opportunities",
      enabled: true,
      channel: "both",
      frequency: "immediate"
    },
    {
      type: "waiver",
      displayName: "Waiver Notifications",
      description: "Updates about waiver requests and approvals",
      enabled: true,
      channel: "in-app",
      frequency: "immediate"
    },
    {
      type: "payment",
      displayName: "Payment Notifications",
      description: "Updates about payments and fee reminders",
      enabled: true,
      channel: "both",
      frequency: "immediate"
    },
    {
      type: "comment",
      displayName: "Comment Notifications",
      description: "Notifications when someone comments on your tasks",
      enabled: true,
      channel: "in-app",
      frequency: "immediate"
    },
    {
      type: "system",
      displayName: "System Notifications",
      description: "Important system announcements and updates",
      enabled: true,
      channel: "both",
      frequency: "immediate"
    }
  ])
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load user preferences from Firebase
  useEffect(() => {
    async function loadPreferences() {
      if (!currentUser) return
      
      try {
        const db = getDatabase()
        const prefsRef = ref(db, `users/${currentUser.uid}/notificationPreferences`)
        const snapshot = await get(prefsRef)
        
        if (snapshot.exists()) {
          const savedPrefs = snapshot.val()
          setPreferences(prevPrefs => 
            prevPrefs.map(pref => ({
              ...pref,
              ...savedPrefs[pref.type]
            }))
          )
        }
      } catch (error) {
        console.error("Error loading notification preferences:", error)
        toast({
          variant: "destructive",
          title: "Failed to load preferences",
          description: "Your notification preferences could not be loaded."
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadPreferences()
  }, [currentUser, toast])
  
  const handleToggleChange = (type: string, enabled: boolean) => {
    setPreferences(prevPrefs => 
      prevPrefs.map(pref => 
        pref.type === type ? { ...pref, enabled } : pref
      )
    )
  }
  
  const handleChannelChange = (type: string, channel: "in-app" | "email" | "both") => {
    setPreferences(prevPrefs => 
      prevPrefs.map(pref => 
        pref.type === type ? { ...pref, channel } : pref
      )
    )
  }
  
  const handleFrequencyChange = (type: string, frequency: "immediate" | "hourly" | "daily") => {
    setPreferences(prevPrefs => 
      prevPrefs.map(pref => 
        pref.type === type ? { ...pref, frequency } : pref
      )
    )
  }
  
  const savePreferences = async () => {
    if (!currentUser) return
    
    setSaving(true)
    try {
      const db = getDatabase()
      const prefsRef = ref(db, `users/${currentUser.uid}/notificationPreferences`)
      
      // Convert array to object format for storage
      const prefsObject = preferences.reduce((acc, pref) => {
        acc[pref.type] = {
          enabled: pref.enabled,
          channel: pref.channel,
          frequency: pref.frequency
        }
        return acc
      }, {} as Record<string, Omit<NotificationPreference, 'type' | 'displayName' | 'description'>>)
      
      await set(prefsRef, prefsObject)
      
      toast({
        title: "Preferences saved",
        description: "Your notification preferences have been updated."
      })
    } catch (error) {
      console.error("Error saving notification preferences:", error)
      toast({
        variant: "destructive",
        title: "Failed to save preferences",
        description: "Your notification preferences could not be saved."
      })
    } finally {
      setSaving(false)
    }
  }
  
  const handleAllToggle = (enabled: boolean) => {
    setPreferences(prevPrefs => 
      prevPrefs.map(pref => ({ ...pref, enabled }))
    )
  }

  if (loading) {
    return <div className="text-center p-4">Loading notification preferences...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Control how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Notifications</TabsTrigger>
            <TabsTrigger value="delivery">Delivery Methods</TabsTrigger>
            <TabsTrigger value="frequency">Frequency</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h3 className="font-medium">Enable All Notifications</h3>
                <p className="text-sm text-muted-foreground">Quickly toggle all notification types</p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={preferences.every(p => p.enabled)} 
                  onCheckedChange={handleAllToggle}
                  id="all-notifications"
                />
              </div>
            </div>
            
            {preferences.map((pref) => (
              <div key={pref.type} className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor={`${pref.type}-toggle`} className="font-medium">
                    {pref.displayName}
                  </Label>
                  <p className="text-sm text-muted-foreground">{pref.description}</p>
                  {pref.type === "meeting" && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {getNotificationsByType("meeting").length} recent notifications
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id={`${pref.type}-toggle`}
                    checked={pref.enabled}
                    onCheckedChange={(checked) => handleToggleChange(pref.type, checked)}
                  />
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="delivery" className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Choose how you want to receive each type of notification
            </p>
            
            {preferences.map((pref) => (
              <div key={`${pref.type}-delivery`} className="flex items-center justify-between py-2">
                <div>
                  <Label className="font-medium">{pref.displayName}</Label>
                </div>
                <Select 
                  value={pref.channel} 
                  onValueChange={(value) => handleChannelChange(pref.type, value as any)}
                  disabled={!pref.enabled}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Select delivery" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-app">In-app only</SelectItem>
                    <SelectItem value="email">Email only</SelectItem>
                    <SelectItem value="both">Both in-app & email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="frequency" className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Control how frequently you receive notifications
            </p>
            
            {preferences.map((pref) => (
              <div key={`${pref.type}-frequency`} className="flex items-center justify-between py-2">
                <div>
                  <Label className="font-medium">{pref.displayName}</Label>
                </div>
                <Select 
                  value={pref.frequency} 
                  onValueChange={(value) => handleFrequencyChange(pref.type, value as any)}
                  disabled={!pref.enabled}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly digest</SelectItem>
                    <SelectItem value="daily">Daily digest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex justify-end">
          <Button onClick={savePreferences} disabled={saving}>
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
