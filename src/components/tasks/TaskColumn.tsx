
import { Task, TaskStatus } from "@/types/task"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TaskCard } from "./TaskCard"

interface TaskColumnProps {
  title: string
  status: TaskStatus
  tasks: Task[]
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, status: TaskStatus) => void
  onDragStart: (e: React.DragEvent, taskId: string) => void
  onTimerToggle: (taskId: string) => void
  formatDuration: (milliseconds: number) => string
  canStartTask: (taskId: string) => Promise<boolean>
}

export function TaskColumn({
  title,
  status,
  tasks,
  onDragOver,
  onDrop,
  onDragStart,
  onTimerToggle,
  formatDuration,
  canStartTask
}: TaskColumnProps) {
  const columnTasks = tasks.filter(task => task.status === status)
  
  // Colors for different statuses
  const getStatusColor = () => {
    switch(status) {
      case 'not-started':
        return 'bg-blue-50 dark:bg-blue-950';
      case 'in-progress':
        return 'bg-amber-50 dark:bg-amber-950';
      case 'completed':
        return 'bg-green-50 dark:bg-green-950';
      case 'blocked':
        return 'bg-red-50 dark:bg-red-950';
      default:
        return 'bg-gray-50 dark:bg-gray-900';
    }
  }

  return (
    <Card
      className={`p-4 shadow-sm transition-all ${getStatusColor()} border-t-4 ${
        status === 'not-started' ? 'border-blue-400' : 
        status === 'in-progress' ? 'border-amber-400' : 
        status === 'completed' ? 'border-green-400' : 
        'border-red-400'
      }`}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        {title}
        <Badge variant="secondary" className="ml-auto">
          {columnTasks.length}
        </Badge>
      </h3>
      
      <div className="space-y-4 min-h-[200px]">
        {columnTasks.length === 0 ? (
          <div className="h-24 border border-dashed rounded-md flex items-center justify-center text-muted-foreground text-sm">
            Drop tasks here
          </div>
        ) : (
          columnTasks.map(task => (
            <div 
              key={task.id} 
              onDragStart={(e) => onDragStart(e, task.id)}
              draggable 
              className="cursor-move transition-transform active:scale-95"
            >
              <TaskCard
                task={task}
                onTimerToggle={onTimerToggle}
                formatDuration={formatDuration}
                canStartTask={canStartTask}
              />
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
