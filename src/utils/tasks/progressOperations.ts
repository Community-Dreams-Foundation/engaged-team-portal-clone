
import { getDatabase, ref, get, update } from "firebase/database"
import type { Task } from "@/types/task"

export const checkDependencies = async (userId: string, taskId: string): Promise<boolean> => {
  const db = getDatabase()
  const taskRef = ref(db, `users/${userId}/tasks/${taskId}`)
  const taskSnapshot = await get(taskRef)
  const task = taskSnapshot.val()

  if (!task.dependencies || task.dependencies.length === 0) {
    return true
  }

  const dependenciesRef = ref(db, `users/${userId}/tasks`)
  const dependenciesSnapshot = await get(dependenciesRef)
  const dependencies = dependenciesSnapshot.val()

  return task.dependencies.every((depId: string) => 
    dependencies[depId] && dependencies[depId].status === 'completed'
  )
}

export const updateTaskProgress = async (
  userId: string,
  taskId: string,
  completionPercentage: number
) => {
  const db = getDatabase()
  const now = Date.now()
  return update(ref(db, `users/${userId}/tasks/${taskId}`), {
    completionPercentage,
    updatedAt: now,
    lastActivity: {
      type: "status_change",
      timestamp: now,
      details: `Progress updated to ${completionPercentage}%`
    }
  })
}

