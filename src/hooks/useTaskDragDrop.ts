
import { useCallback } from "react"
import { Task, TaskStatus } from "@/types/task"
import { useToast } from "@/components/ui/use-toast"
import { updateTaskStatus, checkDependencies } from "@/utils/tasks/progressOperations"

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
      const canStart = await checkDependencies(userId, taskId)
      if (newStatus === 'in-progress' && !canStart) {
        toast({
          variant: "destructive",
          title: "Cannot start task",
          description: "Not all dependencies are completed."
        })
        return
      }

      await updateTaskStatus(userId, taskId, newStatus)
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
