
import { getDatabase, ref, onValue, update, push, set } from "firebase/database"
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
  return set(newTaskRef, task)
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
  return update(ref(db, `users/${userId}/tasks/${taskId}`), {
    isTimerRunning,
    startTime,
    totalElapsedTime
  })
}
