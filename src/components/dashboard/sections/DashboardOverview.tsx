
import { Card, CardContent } from "@/components/ui/card"
import { Bot, Clock, CheckCircle, AlertTriangle, BarChart3 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Task } from "@/types/task"

interface DashboardOverviewProps {
  tasks: Task[]
}

export function DashboardOverview({ tasks }: DashboardOverviewProps) {
  // Calculate task metrics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.status === "completed").length
  const inProgressTasks = tasks.filter(task => task.status === "in-progress").length
  const blockedTasks = tasks.filter(task => task.status === "blocked").length
  const todoTasks = tasks.filter(task => 
    task.status === "todo" || task.status === "not-started"
  ).length
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  
  // Calculate estimated remaining work time (simplified calculation)
  const estimatedRemainingHours = tasks
    .filter(task => task.status !== "completed")
    .reduce((total, task) => total + (task.estimatedDuration / 60), 0)
    .toFixed(1)

  const cards = [
    {
      title: "Task Completion",
      value: `${completionRate}%`,
      icon: CheckCircle,
      description: `${completedTasks} of ${totalTasks} tasks completed`,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950/40"
    },
    {
      title: "In Progress",
      value: inProgressTasks,
      icon: Clock,
      description: `${estimatedRemainingHours} hours remaining`,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/40"
    },
    {
      title: "Blocked Tasks",
      value: blockedTasks,
      icon: AlertTriangle,
      description: blockedTasks > 0 ? "Needs attention" : "No blocked tasks",
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950/40"
    },
    {
      title: "Performance Score",
      value: "86",
      icon: BarChart3,
      description: "Above team average",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/40"
    },
    {
      title: "CoS Agent",
      value: "Active",
      icon: Bot,
      description: "3 recommendations available",
      color: "text-primary",
      bgColor: "bg-primary-50 dark:bg-primary/10"
    }
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, index) => (
          <Card key={index} className="overflow-hidden border-none shadow-sm">
            <CardContent className={`p-6 ${card.bgColor}`}>
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-muted-foreground">{card.title}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{card.value}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </div>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              {card.title === "Task Completion" && (
                <Progress value={completionRate} className="mt-3 h-1.5" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
