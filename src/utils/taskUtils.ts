import { getDatabase, ref, onValue, update, push, set, get } from "firebase/database"
import { Task, TaskStatus, TaskInput } from "@/types/task"

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

export const createTask = async (userId: string, task: TaskInput) => {
  const db = getDatabase()
  const tasksRef = ref(db, `users/${userId}/tasks`)
  const newTaskRef = push(tasksRef)
  const now = Date.now()
  
  return set(newTaskRef, {
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
}

export const updateTaskStatus = async (
  userId: string,
  taskId: string,
  newStatus: TaskStatus
) => {
  const db = getDatabase()
  const now = Date.now()
  return update(ref(db, `users/${userId}/tasks/${taskId}`), {
    status: newStatus,
    updatedAt: now,
    lastActivity: {
      type: "status_change",
      timestamp: now,
      details: `Status changed to ${newStatus}`
    }
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
  const now = Date.now()
  const updates: Record<string, any> = {
    isTimerRunning,
    updatedAt: now,
    lastActivity: {
      type: "timer_update",
      timestamp: now,
      details: isTimerRunning ? "Timer started" : "Timer stopped"
    }
  }
  
  if (startTime !== undefined) updates.startTime = startTime
  if (totalElapsedTime !== undefined) updates.totalElapsedTime = totalElapsedTime
  
  return update(ref(db, `users/${userId}/tasks/${taskId}`), updates)
}

export const updateTaskMetadata = async (
  userId: string,
  taskId: string,
  metadata: Task["metadata"]
) => {
  const db = getDatabase()
  const now = Date.now()
  return update(ref(db, `users/${userId}/tasks/${taskId}`), {
    metadata,
    updatedAt: now
  })
}

export const addTaskComment = async (
  userId: string,
  taskId: string,
  comment: Omit<NonNullable<Task["comments"]>[0], "id" | "timestamp">
) => {
  const db = getDatabase()
  const commentsRef = ref(db, `users/${userId}/tasks/${taskId}/comments`)
  const newCommentRef = push(commentsRef)
  const now = Date.now()
  
  return update(ref(db, `users/${userId}/tasks/${taskId}`), {
    [`comments/${newCommentRef.key}`]: {
      ...comment,
      id: newCommentRef.key,
      timestamp: now
    },
    updatedAt: now,
    lastActivity: {
      type: "comment",
      timestamp: now,
      details: "New comment added"
    }
  })
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

export const autoSplitTask = async (userId: string, taskId: string) => {
  const db = getDatabase()
  const taskRef = ref(db, `users/${userId}/tasks/${taskId}`)
  const taskSnapshot = await get(taskRef)
  const task = taskSnapshot.val() as Task
  
  if (!task) return false

  const timeThreshold = task.estimatedDuration * 60 * 1000 * 0.9 // 90% of estimated time
  const currentTime = task.totalElapsedTime || 0
  
  if (currentTime >= timeThreshold && task.status !== "completed") {
    const remainingWork = 100 - (task.completionPercentage || 0)
    const splitPoint = Math.floor(remainingWork / 2)
    
    const subtasks: TaskInput[] = [
      {
        title: `${task.title} (Part 1)`,
        description: `First half of original task: ${task.description}`,
        estimatedDuration: Math.ceil(task.estimatedDuration / 2),
        actualDuration: 0,
        status: "todo",
        priority: task.priority,
        dependencies: task.dependencies,
        tags: [...(task.tags || []), "auto-split"],
        assignedTo: task.assignedTo,
        metadata: task.metadata
      },
      {
        title: `${task.title} (Part 2)`,
        description: `Second half of original task: ${task.description}`,
        estimatedDuration: Math.floor(task.estimatedDuration / 2),
        actualDuration: 0,
        status: "todo",
        priority: task.priority,
        dependencies: task.dependencies,
        tags: [...(task.tags || []), "auto-split"],
        assignedTo: task.assignedTo,
        metadata: task.metadata
      }
    ]
    
    const [subtask1Id, subtask2Id] = await Promise.all([
      createTask(userId, subtasks[0]),
      createTask(userId, subtasks[1])
    ])
    
    await update(taskRef, {
      status: "completed",
      completionPercentage: 100,
      updatedAt: Date.now(),
      lastActivity: {
        type: "status_change",
        timestamp: Date.now(),
        details: "Task automatically split into subtasks"
      },
      metadata: {
        ...task.metadata,
        splitIntoTasks: [subtask1Id, subtask2Id]
      }
    })
    
    return true
  }
  
  return false
}

export const checkTaskSplitNeeded = async (userId: string, taskId: string) => {
  const db = getDatabase()
  const taskRef = ref(db, `users/${userId}/tasks/${taskId}`)
  const taskSnapshot = await get(taskRef)
  const task = taskSnapshot.val() as Task
  
  if (!task) return false
  
  const timeThreshold = task.estimatedDuration * 60 * 1000 * 0.9 // 90% of estimated time
  const currentTime = task.totalElapsedTime || 0
  
  return currentTime >= timeThreshold && task.status !== "completed"
}
