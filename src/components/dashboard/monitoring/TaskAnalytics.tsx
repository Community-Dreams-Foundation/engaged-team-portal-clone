
import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Brain, Clock, TrendingUp } from "lucide-react"
import type { Task } from "@/types/task"

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

    // Identify bottlenecks (tasks taking longer than estimated)
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

    // Check for tasks that might need splitting
    const tasksSplitRecommended = inProgressTasks.filter(task => {
      const timeThreshold = task.estimatedDuration * 60 * 1000 * 0.9 // 90% of estimated time
      return (task.totalElapsedTime || 0) >= timeThreshold && 
             task.metadata?.autoSplitEligible === true
    })

    return {
      avgCompletionTime,
      bottlenecks,
      blockedTasks,
      tasksSplitRecommended,
    }
  }, [tasks])

  if (tasks.length === 0) return null

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2 text-primary">
        <Brain className="h-5 w-5" />
        <h3 className="font-medium">AI Task Insights</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analytics.avgCompletionTime > 0 && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>Time Analysis</AlertTitle>
            <AlertDescription>
              Average task completion time: {Math.round(analytics.avgCompletionTime)} minutes
            </AlertDescription>
          </Alert>
        )}

        {analytics.bottlenecks.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Performance Bottlenecks</AlertTitle>
            <AlertDescription>
              {analytics.bottlenecks.length} tasks are taking longer than estimated
            </AlertDescription>
          </Alert>
        )}

        {analytics.blockedTasks.length > 0 && (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Dependency Blockers</AlertTitle>
            <AlertDescription>
              {analytics.blockedTasks.length} tasks are blocked by incomplete dependencies
            </AlertDescription>
          </Alert>
        )}

        {analytics.tasksSplitRecommended.length > 0 && (
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertTitle>Task Split Recommendations</AlertTitle>
            <AlertDescription>
              {analytics.tasksSplitRecommended.length} tasks could be split for better management
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  )
}
