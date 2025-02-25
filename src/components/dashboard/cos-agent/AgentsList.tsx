
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Bot, Trophy, Timer, Activity } from "lucide-react"
import type { Agent } from "@/types/task"

interface AgentsListProps {
  agents: Agent[];
}

export function AgentsList({ agents }: AgentsListProps) {
  return (
    <div className="space-y-3">
      {agents.map((agent) => (
        <Card key={agent.id} className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <span className="font-medium">{agent.name}</span>
              <Badge variant="outline" className="ml-2">
                {agent.status}
              </Badge>
            </div>
            <Badge variant="secondary">
              {agent.assignedTasks.length} tasks
            </Badge>
          </div>
          <Progress value={agent.currentLoad} className="mt-2" />
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              {(agent.performance.successRate * 100).toFixed(0)}%
            </span>
            <span className="flex items-center gap-1">
              <Timer className="h-3 w-3" />
              {agent.performance.averageTaskTime}m
            </span>
            <span className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              {agent.performance.tasksCompleted} completed
            </span>
          </div>
        </Card>
      ))}
    </div>
  )
}
