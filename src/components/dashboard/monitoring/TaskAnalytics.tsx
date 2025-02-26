
import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Brain, Clock, TrendingUp, Users } from "lucide-react"
import type { Task } from "@/types/task"
import { WeeklyActivityChart } from "../metrics/WeeklyActivityChart"
import { StatsGrid } from "../metrics/StatsGrid"

interface TaskAnalyticsProps {
  tasks: Task[]
}

export function TaskAnalytics({ tasks }: TaskAnalyticsProps) {
  const analytics = useMemo(() => {
    const completedTasks = tasks.filter(t => t.status === "completed")
    const inProgressTasks = tasks.filter(t => t.status === "in-progress")
    
    // Calculate average completion time
    const avgCompletionTime = completedTasks.length > 0
      ? completedTasks.reduce((acc, task) => acc + (task.actualDuration || 0), 0) / completedTasks.length
      : 0

    // Calculate weekly tasks distribution
    const weeklyTasks = Array(7).fill(0).map((_, i) => {
      const day = new Date()
      day.setDate(day.getDate() - i)
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt || 0)
        return taskDate.toDateString() === day.toDateString()
      })
      return {
        name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()],
        tasks: dayTasks.length
      }
    }).reverse()

    // Calculate efficiency score
    const efficiency = completedTasks.length > 0
      ? (completedTasks.filter(task => 
          task.actualDuration && task.estimatedDuration && 
          task.actualDuration <= task.estimatedDuration * 1.1
        ).length / completedTasks.length) * 100
      : 0

    // Identify bottlenecks
    const bottlenecks = tasks.filter(task => 
      task.actualDuration && task.estimatedDuration && 
      task.actualDuration > task.estimatedDuration * 1.2
    )

    // Analyze dependencies for potential blockers
    const blockedTasks = tasks.filter(task => 
      task.dependencies?.some(depId => 
        !tasks.find(t => t.id === depId && t.status === "completed")
      )
    )

    return {
      avgCompletionTime,
      weeklyTasks,
      efficiency,
      bottlenecks,
      blockedTasks,
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      inProgressTasks: inProgressTasks.length
    }
  }, [tasks])

  if (tasks.length === 0) return null

  return (
    <Card className="p-4 space-y-6">
      <CardHeader className="px-0">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle>Performance Analytics</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="px-0 space-y-6">
        <StatsGrid
          efficiency={analytics.efficiency}
          completedTasks={analytics.completedTasks}
          totalTasks={analytics.totalTasks}
        />

        <div className="space-y-4">
          <h4 className="font-medium">Weekly Activity</h4>
          <WeeklyActivityChart weeklyTasks={analytics.weeklyTasks} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.avgCompletionTime > 0 && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle>Average Completion Time</AlertTitle>
              <AlertDescription>
                {Math.round(analytics.avgCompletionTime)} minutes per task
              </AlertDescription>
            </Alert>
          )}

          {analytics.bottlenecks.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Performance Bottlenecks</AlertTitle>
              <AlertDescription>
                {analytics.bottlenecks.length} tasks taking longer than estimated
              </AlertDescription>
            </Alert>
          )}

          {analytics.blockedTasks.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Dependency Blockers</AlertTitle>
              <AlertDescription>
                {analytics.blockedTasks.length} tasks blocked by dependencies
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
