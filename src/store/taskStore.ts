import { create } from "zustand";
import { Task, TaskStatus } from "../types/task";

interface TaskState {
  // Tasks state
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;

  // Task operations
  removeTask: (taskId: string) => void;

  // Get tasks by status
  getTasksByStatus: (status: TaskStatus) => Task[];

  // Flag to force refreshes
  refreshCounter: number;
  incrementRefreshCounter: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  setTasks: (tasks: Task[]) => {
    set({ tasks });
  },

  removeTask: (taskId: string) => {
    set((state) => {
      return {
        tasks: state.tasks.filter((task) => task._id !== taskId),
        refreshCounter: state.refreshCounter + 1,
      };
    });
  },

  // Get tasks filtered by status
  getTasksByStatus: (status: TaskStatus) => {
    return get().tasks.filter((task) => task.status === status);
  },

  // Force refresh counter
  refreshCounter: 0,
  incrementRefreshCounter: () =>
    set((state) => ({
      refreshCounter: state.refreshCounter + 1,
    })),
}));
