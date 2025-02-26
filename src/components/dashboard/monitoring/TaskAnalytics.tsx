
import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Brain, Clock, Trophy, TrendingUp, Users, Target, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Task } from "@/types/task"
import { WeeklyActivityChart } from "../metrics/WeeklyActivityChart"
import { StatsGrid } from "../metrics/StatsGrid"
import { LeadershipTier } from "@/types/leadership"

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

    // Calculate advanced performance metrics
    const weightedEfficiencyScore = completedTasks.reduce((acc, task) => {
      if (!task.actualDuration || !task.estimatedDuration) return acc
      const weight = getTaskWeight(task)
      const efficiency = task.actualDuration <= task.estimatedDuration ? 1 : 
        task.estimatedDuration / task.actualDuration
      return acc + (efficiency * weight)
    }, 0) / completedTasks.length || 0

    // Calculate leadership impact score based on business value and team efficiency
    const leadershipImpactScore = completedTasks.reduce((acc, task) => {
      const businessValue = task.metadata?.businessValue || 5
      const efficiency = task.metadata?.performanceHistory?.accuracyRate || 0.5
      const stakeholderImpact = task.metadata?.externalStakeholder ? 1.5 : 1
      return acc + (businessValue * efficiency * stakeholderImpact)
    }, 0) / (completedTasks.length || 1)

    // Calculate innovation and mentorship scores
    const innovationScore = tasks.reduce((acc, task) => {
      if (!task.metadata) return acc
      const complexity = task.metadata.complexity === 'high' ? 2 : 
                        task.metadata.complexity === 'medium' ? 1.5 : 1
      const learningOpportunity = task.metadata.learningOpportunity || 5
      return acc + (complexity * learningOpportunity / 10)
    }, 0) / (tasks.length || 1) * 100

    // Domain-specific performance tracking
    const domainPerformance = tasks.reduce((acc, task) => {
      const domain = task.metadata?.domain
      if (!domain) return acc
      if (!acc[domain]) acc[domain] = { total: 0, completed: 0 }
      acc[domain].total++
      if (task.status === 'completed') acc[domain].completed++
      return acc
    }, {} as Record<string, { total: number, completed: number }>)

    // Calculate tier eligibility based on performance metrics
    const determineTierEligibility = (): LeadershipTier => {
      const metrics = {
        taskCompletion: completedTasks.length / (tasks.length || 1),
        efficiency: weightedEfficiencyScore,
        impact: leadershipImpactScore,
        innovation: innovationScore / 100
      }

      if (metrics.taskCompletion > 0.9 && metrics.efficiency > 0.9 && 
          metrics.impact > 8 && metrics.innovation > 0.8) {
        return "executive"
      } else if (metrics.taskCompletion > 0.8 && metrics.efficiency > 0.8 && 
                 metrics.impact > 7) {
        return "product-owner"
      } else if (metrics.taskCompletion > 0.7 && metrics.efficiency > 0.7) {
        return "team-lead"
      } else if (metrics.taskCompletion > 0.6) {
        return "captain"
      }
      return "emerging"
    }

    // Calculate incentive progress and achievements
    const incentiveProgress = {
      currentTier: determineTierEligibility(),
      domainMastery: Object.entries(domainPerformance).map(([domain, stats]) => ({
        domain,
        masteryLevel: (stats.completed / stats.total) * 100
      })),
      achievements: [
        {
          id: "efficiency-master",
          name: "Efficiency Master",
          earned: weightedEfficiencyScore > 0.9,
          description: "Consistently complete tasks ahead of schedule"
        },
        {
          id: "innovation-leader",
          name: "Innovation Leader",
          earned: innovationScore > 80,
          description: "Drive innovation and learning across the team"
        },
        {
          id: "team-catalyst",
          name: "Team Catalyst",
          earned: leadershipImpactScore > 8,
          description: "Exceptional impact on team performance"
        }
      ],
      metrics: {
        efficiency: weightedEfficiencyScore * 100,
        impact: leadershipImpactScore * 10,
        innovation: innovationScore,
        completedTasks: completedTasks.length,
        domainExpertise: Object.values(domainPerformance).reduce((acc, stats) => 
          acc + (stats.completed / stats.total), 0) / Object.keys(domainPerformance).length * 100
      }
    }

    return {
      efficiency: weightedEfficiencyScore * 100,
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      inProgressTasks: inProgressTasks.length,
      highPriorityCompletion: highPriorityTasks.filter(t => t.status === "completed").length / 
                             (highPriorityTasks.length || 1) * 100,
      leadershipImpactScore,
      innovationScore,
      incentiveProgress,
      domainPerformance
    }
  }, [tasks])

  if (tasks.length === 0) return null

  return (
    <Card className="p-4 space-y-6">
      <CardHeader className="px-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>Leadership Analytics</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Current Tier:</span>
            <Badge className="bg-primary">{analytics.incentiveProgress.currentTier}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0 space-y-6">
        <StatsGrid
          efficiency={analytics.efficiency}
          completedTasks={analytics.completedTasks}
          totalTasks={analytics.totalTasks}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertTitle>Leadership Impact</AlertTitle>
            <AlertDescription>
              {(analytics.leadershipImpactScore * 10).toFixed(1)}/100 in business value and team efficiency
            </AlertDescription>
          </Alert>

          <Alert>
            <Star className="h-4 w-4" />
            <AlertTitle>Innovation Score</AlertTitle>
            <AlertDescription>
              {analytics.innovationScore.toFixed(1)}/100 in driving innovation and learning
            </AlertDescription>
          </Alert>

          <Alert>
            <Target className="h-4 w-4" />
            <AlertTitle>Domain Expertise</AlertTitle>
            <AlertDescription>
              {analytics.incentiveProgress.metrics.domainExpertise.toFixed(1)}% mastery across domains
            </AlertDescription>
          </Alert>

          <Alert variant="default">
            <Trophy className="h-4 w-4" />
            <AlertTitle>Achievements</AlertTitle>
            <AlertDescription className="space-x-2">
              {analytics.incentiveProgress.achievements
                .filter(achievement => achievement.earned)
                .map(achievement => (
                  <span key={achievement.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {achievement.name}
                  </span>
                ))}
            </AlertDescription>
          </Alert>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Weekly Activity & Progress</h4>
          <WeeklyActivityChart weeklyTasks={[
            { name: 'Mon', tasks: 0 },
            { name: 'Tue', tasks: 0 },
            { name: 'Wed', tasks: 0 },
            { name: 'Thu', tasks: 0 },
            { name: 'Fri', tasks: 0 }
          ]} />
        </div>
      </CardContent>
    </Card>
  )
}
