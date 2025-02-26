
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
    const highPriorityTasks = tasks.filter(t => t.priority === "high")
    
    // Calculate weighted efficiency score based on task complexity and priority
    const getTaskWeight = (task: Task) => {
      const complexityWeight = {
        low: 1,
        medium: 1.5,
        high: 2
      }[task.metadata?.complexity || "medium"]

      const priorityWeight = {
        low: 1,
        medium: 1.5,
        high: 2
      }[task.priority || "medium"]

      return complexityWeight * priorityWeight
    }

    const weightedEfficiencyScore = completedTasks.reduce((acc, task) => {
      if (!task.actualDuration || !task.estimatedDuration) return acc
      const weight = getTaskWeight(task)
      const efficiency = task.actualDuration <= task.estimatedDuration ? 1 : 
        task.estimatedDuration / task.actualDuration
      return acc + (efficiency * weight)
    }, 0) / completedTasks.length || 0

    // Calculate advanced performance metrics
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

    // Calculate AI-based performance indicators
    const taskQualityScore = completedTasks.reduce((acc, task) => {
      const businessValue = task.metadata?.businessValue || 5
      const learningOpportunity = task.metadata?.learningOpportunity || 5
      return acc + ((businessValue + learningOpportunity) / 2)
    }, 0) / (completedTasks.length || 1)

    const leadershipScore = tasks.reduce((acc, task) => {
      const delegationScore = task.assignedTo ? 1 : 0
      const priorityManagement = task.priority === "high" && task.status === "completed" ? 1 : 0
      return acc + delegationScore + priorityManagement
    }, 0) / (tasks.length || 1) * 100

    // Identify bottlenecks and improvements
    const bottlenecks = tasks.filter(task => 
      task.actualDuration && task.estimatedDuration && 
      task.actualDuration > task.estimatedDuration * 1.2
    )

    const blockedTasks = tasks.filter(task => 
      task.dependencies?.some(depId => 
        !tasks.find(t => t.id === depId && t.status === "completed")
      )
    )

    const improvementOpportunities = tasks
      .filter(task => task.metadata?.autoSplitEligible)
      .length

    return {
      avgCompletionTime,
      weeklyTasks,
      efficiency: weightedEfficiencyScore * 100,
      bottlenecks,
      blockedTasks,
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      inProgressTasks: inProgressTasks.length,
      highPriorityCompletion: highPriorityTasks.filter(t => t.status === "completed").length / 
                             (highPriorityTasks.length || 1) * 100,
      taskQualityScore,
      leadershipScore,
      improvementOpportunities
    }
  }, [tasks])

  if (tasks.length === 0) return null

  return (
    <Card className="p-4 space-y-6">
      <CardHeader className="px-0">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle>AI Performance Analytics</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="px-0 space-y-6">
        <StatsGrid
          efficiency={analytics.efficiency}
          completedTasks={analytics.completedTasks}
          totalTasks={analytics.totalTasks}
        />

        <div className="space-y-4">
          <h4 className="font-medium">Weekly Activity & AI Insights</h4>
          <WeeklyActivityChart weeklyTasks={analytics.weeklyTasks} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertTitle>Task Quality Score</AlertTitle>
            <AlertDescription>
              {analytics.taskQualityScore.toFixed(1)}/10 based on business value and learning impact
            </AlertDescription>
          </Alert>

          <Alert>
            <Users className="h-4 w-4" />
            <AlertTitle>Leadership Performance</AlertTitle>
            <AlertDescription>
              {analytics.leadershipScore.toFixed(1)}% effectiveness in delegation and priority management
            </AlertDescription>
          </Alert>

          {analytics.avgCompletionTime > 0 && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle>Average Task Time</AlertTitle>
              <AlertDescription>
                {Math.round(analytics.avgCompletionTime)} minutes per task
                {analytics.improvementOpportunities > 0 && (
                  <> ({analytics.improvementOpportunities} tasks eligible for optimization)</>
                )}
              </AlertDescription>
            </Alert>
          )}

          {analytics.bottlenecks.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Performance Bottlenecks</AlertTitle>
              <AlertDescription>
                {analytics.bottlenecks.length} tasks significantly exceeding estimates
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
