
import { useState, useCallback, useEffect } from "react"
import { Task } from "@/types/task"
import { useToast } from "@/hooks/use-toast"
import { updateTaskTimer } from "@/utils/tasks/timerOperations"
import { recordTimerUpdate } from "@/utils/tasks/activityOperations"

export function useTaskTimer(tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>, userId?: string) {
  const { toast } = useToast()

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(currentTasks => 
        currentTasks.map(task => {
          if (task.isTimerRunning && task.startTime) {
            const elapsedSinceStart = Date.now() - task.startTime
            const totalElapsed = (task.totalElapsedTime || 0) + elapsedSinceStart
            
            // We don't need to show the toast here anymore as the monitoringService will handle alerts
            
            return {
              ...task,
              totalElapsedTime: totalElapsed
            }
          }
          return task
        })
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [setTasks])

  const toggleTimer = useCallback(async (taskId: string) => {
    if (!userId) return

    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    try {
      const now = Date.now()
      const isTimerRunning = !task.isTimerRunning
      const startTime = isTimerRunning ? now : undefined
      const totalElapsedTime = !isTimerRunning 
        ? (task.totalElapsedTime || 0) + (task.startTime ? now - task.startTime : 0)
        : task.totalElapsedTime

      // Update the timer in the database
      await updateTaskTimer(
        userId,
        taskId,
        isTimerRunning,
        startTime,
        totalElapsedTime
      )
      
      // Log the timer activity
      await recordTimerUpdate(
        userId, 
        taskId, 
        isTimerRunning, 
        !isTimerRunning ? (task.startTime ? now - task.startTime : 0) : undefined
      )

      // Update local state
      setTasks(tasks.map(t => 
        t.id === taskId ? {
          ...t,
          isTimerRunning,
          startTime,
          totalElapsedTime,
          // Update the last activity - this helps with real-time monitoring
          lastActivity: {
            type: "timer_update",
            timestamp: now,
            details: isTimerRunning ? "Timer started" : "Timer stopped"
          }
        } : t
      ))

      toast({
        title: isTimerRunning ? "Timer Started" : "Timer Stopped",
        description: `${task.title} timer has been ${isTimerRunning ? "started" : "stopped"}`,
        variant: "default",
      })

    } catch (error) {
      console.error("Error updating timer:", error)
      toast({
        variant: "destructive",
        title: "Error updating timer",
        description: "Please try again later."
      })
    }
  }, [tasks, userId, setTasks, toast])

  return { toggleTimer }
}
