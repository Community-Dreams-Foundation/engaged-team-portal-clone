
import { getDatabase, ref, onValue, update, push, set, get } from "firebase/database"
import { Task, TaskStatus } from "@/types/task"

export const fetchTasks = async (userId: string): Promise<Task[]> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase()
    const tasksRef = ref(db, `users/${userId}/tasks`)

    onValue(tasksRef, (snapshot) => {
      if (snapshot.exists()) {
        const tasks: Task[] = []
        snapshot.forEach((childSnapshot) => {
          tasks.push({
            id: childSnapshot.key as string,
            ...childSnapshot.val()
          })
        })
        resolve(tasks)
      } else {
        resolve([])
      }
    }, (error) => {
      console.error("Error fetching tasks:", error)
      reject(error)
    })
  })
}

export const createTask = async (userId: string, task: Omit<Task, "id">) => {
  const db = getDatabase()
  const tasksRef = ref(db, `users/${userId}/tasks`)
  const newTaskRef = push(tasksRef)
  return set(newTaskRef, {
    ...task,
    isTimerRunning: false,
    totalElapsedTime: 0
  })
}

export const updateTaskStatus = async (
  userId: string,
  taskId: string,
  newStatus: TaskStatus
) => {
  const db = getDatabase()
  return update(ref(db, `users/${userId}/tasks/${taskId}`), {
    status: newStatus
  })
}

export const updateTaskTimer = async (
  userId: string,
  taskId: string,
  isTimerRunning: boolean,
  startTime?: number,
  totalElapsedTime?: number
) => {
  const db = getDatabase()
  const updates: Record<string, any> = {
    isTimerRunning,
  }
  
  if (startTime !== undefined) updates.startTime = startTime
  if (totalElapsedTime !== undefined) updates.totalElapsedTime = totalElapsedTime
  
  return update(ref(db, `users/${userId}/tasks/${taskId}`), updates)
}

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

