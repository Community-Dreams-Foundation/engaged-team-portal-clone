
import { Task, TaskStatus } from "@/types/task"
import { TaskCard } from "./TaskCard"

interface TaskColumnProps {
  title: string
  status: TaskStatus
  tasks: Task[]
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  onDrop: (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => void
  onTimerToggle: (taskId: string) => void
  formatDuration: (milliseconds: number) => string
  canStartTask: (taskId: string) => Promise<boolean>
  onTaskUpdated?: () => void
}

export function TaskColumn({
  title,
  status,
  tasks,
  onDragStart,
  onDragOver,
  onDrop,
  onTimerToggle,
  formatDuration,
  canStartTask,
  onTaskUpdated
}: TaskColumnProps) {
  const filteredTasks = tasks.filter(task => task.status === status)

  return (
    <div
      className="bg-gray-50 rounded-md p-3"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-sm">{title}</h2>
        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
          {filteredTasks.length}
        </span>
      </div>
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-4 text-sm text-gray-500">
            No tasks
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onDragStart={onDragStart}
              onTimerToggle={onTimerToggle}
              formatDuration={formatDuration}
              canStartTask={canStartTask}
              onTaskUpdated={onTaskUpdated}
            />
          ))
        )}
      </div>
    </div>
  )
}
