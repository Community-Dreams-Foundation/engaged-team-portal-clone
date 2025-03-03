
import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Task } from "@/types/task"
import { Clock, PlayCircle, StopCircle, AlertCircle, CheckCircle, Tag, RotateCw } from "lucide-react"
import { TaskDetailDialog } from "./TaskDetailDialog"

interface TaskCardProps {
  task: Task
  onTimerToggle: (taskId: string) => void
  formatDuration: (milliseconds: number) => string
  canStartTask: (taskId: string) => Promise<boolean>
}

export function TaskCard({ 
  task, 
  onTimerToggle, 
  formatDuration,
  canStartTask 
}: TaskCardProps) {
  const [showDetail, setShowDetail] = useState(false)
  const [canStart, setCanStart] = useState<boolean | null>(null)
  
  const handleTimerClick = async () => {
    // Only check dependencies if task is not already in progress
    if (task.status !== "in-progress" && canStart === null) {
      const check = await canStartTask(task.id)
      setCanStart(check)
      
      if (!check) {
        return // Don't start timer if dependencies aren't met
      }
    }
    
    onTimerToggle(task.id)
  }
  
  return (
    <>
      <Card className="shadow-sm hover:shadow transition-shadow">
        <CardContent className="p-3">
          <div className="space-y-2">
            <div 
              className="font-medium line-clamp-2 cursor-pointer hover:text-primary"
              onClick={() => setShowDetail(true)}
            >
              {task.title}
              {task.recurringConfig?.isRecurring && (
                <span className="ml-2 inline-flex items-center">
                  <RotateCw className="h-3.5 w-3.5 text-blue-500" />
                </span>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground line-clamp-2">
              {task.description || "No description"}
            </div>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {task.priority && (
                <Badge
                  variant="outline"
                  className={
                    task.priority === 'high'
                      ? 'text-red-500 border-red-500'
                      : task.priority === 'medium'
                      ? 'text-yellow-500 border-yellow-500'
                      : 'text-green-500 border-green-500'
                  }
                >
                  {task.priority}
                </Badge>
              )}
              
              {task.dueDate && (
                <Badge variant="outline">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </Badge>
              )}
              
              {task.recurringConfig?.isRecurring && (
                <Badge variant="outline" className="text-blue-500 border-blue-500">
                  <RotateCw className="h-3 w-3 mr-1" />
                  {task.recurringConfig.pattern}
                </Badge>
              )}
              
              {canStart === false && (
                <Badge variant="outline" className="text-red-500 border-red-500">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Blocked
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-1 mt-1">
              {task.tags?.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
              {task.tags && task.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{task.tags.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-3 pt-0 flex justify-between items-center border-t mt-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {formatDuration(task.totalElapsedTime || 0)} / {task.estimatedDuration}m
            </span>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={handleTimerClick}
            title={task.isTimerRunning ? "Pause Timer" : "Start Timer"}
          >
            {task.isTimerRunning ? (
              <StopCircle className="h-5 w-5 text-red-500" />
            ) : (
              <PlayCircle className="h-5 w-5 text-green-500" />
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <TaskDetailDialog
        task={task}
        open={showDetail}
        onOpenChange={setShowDetail}
      />
    </>
  )
}
