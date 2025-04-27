import api from "./api";
import { Task, CreateTaskData, TaskStatus } from "../types/task";

export class TaskError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TaskError";
  }
}

export const taskService = {
  // Fetch all tasks (optionally filtered by status)
  getTasks: async (status?: TaskStatus): Promise<Task[]> => {
    try {
      const params = status ? { status } : {};
      const response = await api.get<Task[]>("/tasks", { params });
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch tasks";
      throw new TaskError(errorMessage);
    }
  },

  // Fetch a task by ID
  getTaskById: async (id: string): Promise<Task> => {
    try {
      const response = await api.get<Task>(`/tasks/${id}`);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch task";
      throw new TaskError(errorMessage);
    }
  },

  // Create a new task
  createTask: async (data: CreateTaskData): Promise<Task> => {
    try {
      const response = await api.post<Task>("/tasks/create", data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new TaskError(
          "Too many task creation attempts. Please try again later."
        );
      }

      const errorMessage =
        error.response?.data?.message || "Failed to create task";
      throw new TaskError(errorMessage);
    }
  },

  // Update an existing task
  updateTask: async (id: string, data: Partial<Task>): Promise<Task> => {
    try {
      if (!id || id === "undefined") {
        throw new TaskError("Invalid task ID");
      }

      const response = await api.put<Task>(`/tasks/${id}`, data);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update task";
      throw new TaskError(errorMessage);
    }
  },

  // Delete a task
  deleteTask: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete<{ message: string }>(`/tasks/${id}`);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete task";
      throw new TaskError(errorMessage);
    }
  },
};
