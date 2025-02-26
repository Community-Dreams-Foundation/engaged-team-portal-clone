
import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Brain, Clock, Trophy, TrendingUp, Users } from "lucide-react"
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

    // Calculate competitive scoring elements
    const completionPoints = completedTasks.reduce((acc, task) => {
      const taskWeight = getTaskWeight(task)
      const onTimeBonus = task.actualDuration && task.estimatedDuration && 
        task.actualDuration <= task.estimatedDuration ? 1.5 : 1
      return acc + (taskWeight * onTimeBonus * 100)
    }, 0)

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

    // Calculate challenge completion metrics
    const challengeMetrics = {
      fastestCompletion: Math.min(...completedTasks.map(t => t.actualDuration || Infinity)),
      highestEfficiency: Math.max(...completedTasks.map(t => {
        if (!t.actualDuration || !t.estimatedDuration) return 0
        return t.estimatedDuration / t.actualDuration
      })),
      consecutiveCompletions: completedTasks.reduce((acc, task, i, arr) => {
        if (i === 0) return 1
        const prevTask = arr[i - 1]
        const prevDate = new Date(prevTask.updatedAt || 0)
        const currDate = new Date(task.updatedAt || 0)
        const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        return dayDiff <= 1 ? acc + 1 : 1
      }, 1)
    }

    // Calculate incentive progress
    const incentiveProgress = {
      points: completionPoints,
      taskMilestones: {
        bronze: completedTasks.length >= 10,
        silver: completedTasks.length >= 25,
        gold: completedTasks.length >= 50
      },
      streakDays: challengeMetrics.consecutiveCompletions,
      efficiencyBadges: {
        speedster: challengeMetrics.fastestCompletion < 30,
        efficient: weightedEfficiencyScore > 0.9,
        consistent: challengeMetrics.consecutiveCompletions >= 7
      }
    }

    return {
      avgCompletionTime,
      weeklyTasks,
      efficiency: weightedEfficiencyScore * 100,
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      inProgressTasks: inProgressTasks.length,
      highPriorityCompletion: highPriorityTasks.filter(t => t.status === "completed").length / 
                             (highPriorityTasks.length || 1) * 100,
      taskQualityScore,
      leadershipScore,
      challengeMetrics,
      incentiveProgress
    }
  }, [tasks])

  if (tasks.length === 0) return null

  return (
    <Card className="p-4 space-y-6">
      <CardHeader className="px-0">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle>Leadership Analytics</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="px-0 space-y-6">
        <StatsGrid
          efficiency={analytics.efficiency}
          completedTasks={analytics.completedTasks}
          totalTasks={analytics.totalTasks}
        />

        <div className="space-y-4">
          <h4 className="font-medium">Weekly Activity & Challenges</h4>
          <WeeklyActivityChart weeklyTasks={analytics.weeklyTasks} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertTitle>Performance Score</AlertTitle>
            <AlertDescription>
              {analytics.taskQualityScore.toFixed(1)}/10 in business impact and learning
            </AlertDescription>
          </Alert>

          <Alert>
            <Users className="h-4 w-4" />
            <AlertTitle>Leadership Rating</AlertTitle>
            <AlertDescription>
              {analytics.leadershipScore.toFixed(1)}% in delegation and priority management
            </AlertDescription>
          </Alert>

          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>Challenge Progress</AlertTitle>
            <AlertDescription>
              {analytics.challengeMetrics.consecutiveCompletions} day streak!
              {analytics.incentiveProgress.taskMilestones.gold && " 🏆 Gold Achievement"}
              {analytics.incentiveProgress.taskMilestones.silver && " 🥈 Silver Achievement"}
              {analytics.incentiveProgress.taskMilestones.bronze && " 🥉 Bronze Achievement"}
            </AlertDescription>
          </Alert>

          <Alert variant="default">
            <Trophy className="h-4 w-4" />
            <AlertTitle>Earned Badges</AlertTitle>
            <AlertDescription className="space-x-2">
              {analytics.incentiveProgress.efficiencyBadges.speedster && 
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  ⚡ Speedster
                </span>
              }
              {analytics.incentiveProgress.efficiencyBadges.efficient && 
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✨ Efficient
                </span>
              }
              {analytics.incentiveProgress.efficiencyBadges.consistent && 
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  🎯 Consistent
                </span>
              }
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  )
}
