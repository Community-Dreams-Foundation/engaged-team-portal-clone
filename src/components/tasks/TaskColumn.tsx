
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
  canStartTask: (taskId: string) => boolean
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

  return (
    <Card
      className="p-4"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        {title}
        <Badge variant="secondary" className="ml-auto">
          {columnTasks.length}
        </Badge>
      </h3>
      
      <div className="space-y-4">
        {columnTasks.map(task => (
          <div key={task.id} onDragStart={(e) => onDragStart(e, task.id)}>
            <TaskCard
              task={task}
              onTimerToggle={onTimerToggle}
              formatDuration={formatDuration}
              canStartTask={canStartTask(task.id)}
            />
          </div>
        ))}
      </div>
    </Card>
  )
}
