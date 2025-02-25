
import { Task } from "@/types/task"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Timer, AlertCircle, Lock, Play, Pause, Clock, Tag, Link2, AlertTriangle } from "lucide-react"
import { format } from "date-fns"

interface TaskCardProps {
  task: Task
  onTimerToggle: (taskId: string) => void
  formatDuration: (milliseconds: number) => string
  canStartTask: boolean
}

export function TaskCard({ task, onTimerToggle, formatDuration, canStartTask }: TaskCardProps) {
  const getPriorityBadge = (priority?: string) => {
    const colors = {
      high: "text-red-500 border-red-500",
      medium: "text-yellow-500 border-yellow-500",
      low: "text-green-500 border-green-500"
    }
    return priority ? (
      <Badge variant="outline" className={colors[priority.toLowerCase()]}>
        {priority}
      </Badge>
    ) : null
  }

  return (
    <Card
      key={task.id}
      className="p-3 cursor-move hover:shadow-md transition-shadow"
      draggable
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h4 className="font-medium">{task.title}</h4>
            <p className="text-sm text-muted-foreground">{task.description}</p>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {getPriorityBadge(task.priority)}
              {task.tags?.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            Est: {task.estimatedDuration}m
          </span>
          {task.dependencies?.length > 0 && (
            <div className="flex items-center gap-1 ml-2">
              <Link2 className="h-4 w-4" />
              <span>{task.dependencies.length} dependencies</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {formatDuration(task.totalElapsedTime || 0)}
            </span>
            {!canStartTask && (
              <span className="flex items-center gap-1 text-yellow-500">
                <Lock className="h-4 w-4" />
              </span>
            )}
            {task.isTimerRunning && (
              <span className="flex items-center gap-1 text-green-500">
                <Timer className="h-4 w-4 animate-pulse" />
              </span>
            )}
            {(task.totalElapsedTime || 0) > task.estimatedDuration * 60 * 1000 && (
              <span className="flex items-center gap-1 text-red-500">
                <AlertTriangle className="h-4 w-4" />
              </span>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onTimerToggle(task.id)}
            disabled={task.status === 'completed'}
          >
            {task.isTimerRunning ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}
