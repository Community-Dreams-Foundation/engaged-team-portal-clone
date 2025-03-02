
import { useCallback } from "react";
import { Task, TaskStatus } from "@/types/task";
import { 
  createTask as createTaskOperation,
  updateTask, 
  deleteTask as deleteTaskOperation,
  fetchTasks as fetchTasksOperation
} from "@/utils/tasks/basicOperations";
import { updateTaskStatus } from "@/utils/tasks/progressOperations";
import { useToast } from "@/hooks/use-toast";

export function useTaskOperations() {
  const { toast } = useToast();

  /**
   * Create a new task
   */
  const createTask = useCallback(async (userId: string, taskData: Omit<Task, "id">) => {
    try {
      return await createTaskOperation(userId, taskData);
    } catch (error) {
      console.error("Error in createTask:", error);
      throw error;
    }
  }, []);

  /**
   * Fetch all tasks for a user
   */
  const fetchTasks = useCallback(async (userId: string) => {
    try {
      return await fetchTasksOperation(userId);
    } catch (error) {
      console.error("Error in fetchTasks:", error);
      throw error;
    }
  }, []);

  /**
   * Delete a task
   */
  const deleteTask = useCallback(async (userId: string, taskId: string) => {
    try {
      await deleteTaskOperation(userId, taskId);
    } catch (error) {
      console.error("Error in deleteTask:", error);
      throw error;
    }
  }, []);
  
  /**
   * Update a task status
   */
  const updateStatus = useCallback(async (userId: string, taskId: string, status: TaskStatus) => {
    try {
      await updateTaskStatus(userId, taskId, status);
    } catch (error) {
      console.error("Error in updateStatus:", error);
      throw error;
    }
  }, []);

  /**
   * Update a task
   */
  const updateTaskData = useCallback(async (userId: string, taskId: string, taskData: Partial<Task>) => {
    try {
      await updateTask(userId, taskId, taskData);
    } catch (error) {
      console.error("Error in updateTaskData:", error);
      throw error;
    }
  }, []);

  return {
    createTask,
    fetchTasks,
    deleteTask,
    updateStatus,
    updateTaskData
  };
}
