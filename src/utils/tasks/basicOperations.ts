
import { getDatabase, ref, onValue, push, set } from "firebase/database"
import { Task, TaskInput } from "@/types/task"

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

export const createTask = async (userId: string, task: TaskInput): Promise<string> => {
  const db = getDatabase()
  const tasksRef = ref(db, `users/${userId}/tasks`)
  const newTaskRef = push(tasksRef)
  const now = Date.now()
  
  await set(newTaskRef, {
    ...task,
    isTimerRunning: false,
    totalElapsedTime: 0,
    createdAt: now,
    updatedAt: now,
    completionPercentage: 0,
    lastActivity: {
      type: "status_change",
      timestamp: now,
      details: "Task created"
    }
  })

  return newTaskRef.key as string
}
