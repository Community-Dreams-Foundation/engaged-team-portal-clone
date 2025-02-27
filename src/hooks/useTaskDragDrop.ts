
import { useCallback } from "react"
import { Task, TaskStatus } from "@/types/task"
import { useToast } from "@/components/ui/use-toast"
import { updateTaskStatus, checkDependencies } from "@/utils/tasks/progressOperations"
import { recordStatusChange } from "@/utils/tasks/activityOperations"

export function useTaskDragDrop(tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>, userId?: string) {
  const { toast } = useToast()

  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData("taskId")
    if (!userId || !taskId) return

    try {
      const task = tasks.find(t => t.id === taskId)
      if (!task) return
      
      const currentStatus = task.status

      // If status hasn't changed, do nothing
      if (currentStatus === newStatus) return

      const canStart = await checkDependencies(userId, taskId)
      if (newStatus === 'in-progress' && !canStart) {
        toast({
          variant: "destructive",
          title: "Cannot start task",
          description: "Not all dependencies are completed."
        })
        return
      }

      // Update the task status
      await updateTaskStatus(userId, taskId, newStatus)
      
      // Log the status change activity
      await recordStatusChange(userId, taskId, currentStatus, newStatus)

      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ))
    } catch (error) {
      console.error("Error updating task status:", error)
      toast({
        variant: "destructive",
        title: "Error updating task",
        description: "Please try again later."
      })
    }
  }, [userId, tasks, setTasks, toast])

  return {
    handleDragStart,
    handleDragOver,
    handleDrop
  }
}
