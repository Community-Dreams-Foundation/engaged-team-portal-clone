
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { startRealTimeMonitoring, stopRealTimeMonitoring } from '@/services/monitoringService'
import { AlertsPanel } from './AlertsPanel'
import { TaskMonitor } from './TaskMonitor'
import { TaskAnalytics } from './TaskAnalytics'
import { Task } from '@/types/task'

interface RealTimeMonitorProps {
  tasks: Task[]
}

export function RealTimeMonitor({ tasks }: RealTimeMonitorProps) {
  const { currentUser } = useAuth()

  useEffect(() => {
    if (!currentUser?.uid) return
    
    // Start real-time monitoring when component mounts
    startRealTimeMonitoring(currentUser.uid)
    
    return () => {
      // Stop monitoring when component unmounts
      stopRealTimeMonitoring(currentUser.uid)
    }
  }, [currentUser?.uid])

  // Calculate statistics
  const overdueTasks = tasks.filter(task => 
    task.status !== "completed" && 
    task.dueDate && 
    task.dueDate < Date.now()
  )
  
  const activeTasks = tasks.filter(task => task.isTimerRunning)
  const highPriorityTasks = tasks.filter(task => task.priority === "high" && task.status !== "completed")
  const blockedTasks = tasks.filter(task => task.status === "blocked" || 
    (task.dependencies && task.dependencies.length > 0 && task.status !== "completed"))
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Tasks</p>
              <p className="text-2xl font-bold">{activeTasks.length}</p>
            </div>
            <Clock className="h-8 w-8 text-green-500 opacity-80" />
          </div>
        </Card>
        
        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold">{overdueTasks.length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500 opacity-80" />
          </div>
        </Card>
        
        <Card className="p-4 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">High Priority</p>
              <p className="text-2xl font-bold">{highPriorityTasks.length}</p>
            </div>
            <Bell className="h-8 w-8 text-yellow-500 opacity-80" />
          </div>
        </Card>
        
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Blocked</p>
              <p className="text-2xl font-bold">{blockedTasks.length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-500 opacity-80" />
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <AlertsPanel />
          <TaskMonitor tasks={tasks} />
        </div>
        
        <div className="space-y-6">
          <TaskAnalytics tasks={tasks} />
        </div>
      </div>
    </div>
  )
}
