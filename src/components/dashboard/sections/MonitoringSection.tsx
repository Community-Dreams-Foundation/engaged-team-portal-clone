
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, BarChart, Bell, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { Task } from "@/types/task"
import { fetchTasks } from "@/utils/tasks/basicOperations"
import { RealTimeMonitor } from "../monitoring/RealTimeMonitor"

export function MonitoringSection() {
  const { currentUser } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("real-time")
  
  useEffect(() => {
    if (!currentUser?.uid) return
    
    const loadTasks = async () => {
      try {
        setLoading(true)
        const fetchedTasks = await fetchTasks(currentUser.uid)
        setTasks(fetchedTasks)
      } catch (error) {
        console.error("Error fetching tasks:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadTasks()
    
    // Set up interval to refresh tasks every minute
    const interval = setInterval(loadTasks, 60000)
    
    return () => clearInterval(interval)
  }, [currentUser?.uid])
  
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-none shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent py-4">
          <div className="flex items-center justify-between flex-wrap">
            <CardTitle className="text-xl font-semibold flex items-center">
              <Activity className="mr-2 h-5 w-5 text-primary" />
              Real-Time Performance Monitoring
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-sm gap-1"
                onClick={() => {/* Open settings */}}
              >
                <Settings className="h-4 w-4" />
                Configure Alerts
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor task performance, set alerts, and optimize your workflow in real-time
          </p>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs defaultValue="real-time" value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b px-4">
              <TabsList className="bg-transparent p-0 h-12">
                <TabsTrigger 
                  value="real-time" 
                  className="h-12 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Real-Time Monitor
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="h-12 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  <BarChart className="h-4 w-4 mr-2" />
                  Detailed Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="alerts" 
                  className="h-12 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Alerts Configuration
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="real-time" className="p-4">
              {loading ? (
                <div className="py-20 text-center text-muted-foreground">
                  <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Loading monitoring data...</p>
                </div>
              ) : (
                <RealTimeMonitor tasks={tasks} />
              )}
            </TabsContent>
            
            <TabsContent value="analytics" className="p-4">
              <div className="py-20 text-center text-muted-foreground">
                <BarChart className="h-10 w-10 mx-auto mb-4 opacity-50" />
                <p>Detailed analytics dashboard is coming soon</p>
                <p className="text-sm">This feature will include advanced metrics and performance insights</p>
              </div>
            </TabsContent>
            
            <TabsContent value="alerts" className="p-4">
              <div className="py-20 text-center text-muted-foreground">
                <Bell className="h-10 w-10 mx-auto mb-4 opacity-50" />
                <p>Alert configuration settings are coming soon</p>
                <p className="text-sm">You'll be able to customize alert thresholds and notification preferences</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
