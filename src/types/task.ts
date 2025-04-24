export type TaskStatus = "pending" | "approved" | "done" | "rejected";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
  };
  updatedAt?: string;
  updatedBy?: {
    id: string;
    name: string;
  };
}

export interface CreateTaskData {
  title: string;
  description?: string;
}