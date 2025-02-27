
import { useState, useEffect } from "react"
import { Task } from "@/types/task"
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, Calendar, Tag, Link2, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { TaskCommentSection } from "./TaskCommentSection"

interface TaskDetailDialogProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskDetailDialog({ task, open, onOpenChange }: TaskDetailDialogProps) {
  if (!task) return null

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  const actualMinutes = task.totalElapsedTime 
    ? Math.floor(task.totalElapsedTime / (1000 * 60)) 
    : 0

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "low":
        return "bg-green-100 text-green-800 border-green-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{task.title}</DialogTitle>
            {task.priority && (
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
            )}
          </div>
          <DialogDescription>
            {task.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Estimated: {formatDuration(task.estimatedDuration)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Actual: {formatDuration(actualMinutes)}
              </span>
            </div>
            
            {task.createdAt && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Created: {format(task.createdAt, 'MMM d, yyyy')}
                </span>
              </div>
            )}
            
            {task.updatedAt && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Updated: {format(task.updatedAt, 'MMM d, yyyy')}
                </span>
              </div>
            )}
          </div>
          
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {task.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {task.dependencies && task.dependencies.length > 0 && (
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {task.dependencies.length} dependencies
              </span>
            </div>
          )}
          
          <Separator />
          
          <TaskCommentSection task={task} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
