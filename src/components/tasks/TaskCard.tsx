import { useState } from "react"
import { Task } from "@/types/task"
import { Clock, MoreVertical, Tag, ArrowRightCircle, CheckCircle, Rotate3D, GitBranch, GitMerge, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistance } from "date-fns"
import { TaskDetailDialog } from "./TaskDetailDialog"

interface TaskCardProps {
  task: Task
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void
  onTimerToggle: (taskId: string) => void
  formatDuration: (milliseconds: number) => string
  canStartTask: (taskId: string) => Promise<boolean>
  onTaskUpdated?: () => void
}

export function TaskCard({
  task,
  onDragStart,
  onTimerToggle,
  formatDuration,
  canStartTask,
  onTaskUpdated
}: TaskCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [canStart, setCanStart] = useState(true)

  useState(() => {
    if (task.status === "todo" || task.status === "not-started") {
      canStartTask(task.id).then(result => setCanStart(result))
    }
  })

  const getPriorityColor = () => {
    switch (task.priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <>
      <div
        className="bg-white rounded-md shadow-sm border p-3 mb-2 cursor-grab hover:shadow"
        draggable
        onDragStart={(e) => onDragStart(e, task.id)}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <div className={`${getPriorityColor()} w-2 h-2 rounded-full mr-2`} />
            <h3 className="font-medium text-sm truncate max-w-[180px]">{task.title}</h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowDetails(true)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTimerToggle(task.id)}>
                {task.isTimerRunning ? "Stop Timer" : "Start Timer"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {task.dueDate && (
          <div className="text-xs text-gray-500 mb-2">
            Due {formatDistance(new Date(task.dueDate), new Date(), { addSuffix: true })}
          </div>
        )}

        <div className="flex items-center gap-2 mb-2">
          {task.isTimerRunning ? (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2 text-red-500 hover:text-red-600"
              onClick={() => onTimerToggle(task.id)}
            >
              <Clock className="h-3 w-3 mr-1 animate-pulse" /> Stop
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => onTimerToggle(task.id)}
              disabled={!canStart && task.status === "todo"}
            >
              <Clock className="h-3 w-3 mr-1" /> Start
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => setShowDetails(true)}
          >
            Details
          </Button>
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          {task.totalElapsedTime !== undefined && task.totalElapsedTime > 0 && (
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {formatDuration(task.totalElapsedTime)}
            </Badge>
          )}
          
          {task.completionPercentage !== undefined && task.completionPercentage > 0 && (
            <Badge variant="secondary" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              {task.completionPercentage}%
            </Badge>
          )}
          
          {task.recurringConfig?.isRecurring && (
            <Badge variant="secondary" className="text-xs text-blue-500 bg-blue-50">
              <Rotate3D className="h-3 w-3 mr-1" />
              Recurring
            </Badge>
          )}
          
          {task.dependencies && task.dependencies.length > 0 && (
            <Badge variant="secondary" className="text-xs text-gray-500 bg-gray-50">
              <Link className="h-3 w-3 mr-1" />
              {task.dependencies.length}
            </Badge>
          )}
          
          {task.metadata?.hasSubtasks && (
            <Badge variant="secondary" className="text-xs text-purple-500 bg-purple-50">
              <GitBranch className="h-3 w-3 mr-1" />
              Subtasks
            </Badge>
          )}
          
          {task.metadata?.parentTaskId && (
            <Badge variant="secondary" className="text-xs text-indigo-500 bg-indigo-50">
              <GitMerge className="h-3 w-3 mr-1" />
              Subtask
            </Badge>
          )}
        </div>

        {!canStart && task.status === "todo" && (
          <div className="mt-2 text-xs text-red-500 flex items-center">
            <ArrowRightCircle className="h-3 w-3 mr-1" />
            Blocked by dependencies
          </div>
        )}
        
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs px-1.5 py-0">
                <Tag className="h-2 w-2 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      <TaskDetailDialog
        task={task}
        open={showDetails}
        onOpenChange={setShowDetails}
        onTaskUpdated={onTaskUpdated}
      />
    </>
  )
}
