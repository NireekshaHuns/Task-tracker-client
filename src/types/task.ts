export type TaskStatus = "pending" | "approved" | "done" | "rejected";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string;
  createdBy: {
    _id: string;
    name: string;
  };
  updatedAt?: string;
  updatedBy?: {
    _id: string;
    name: string;
  };
}

// Payload for creating a new task
export interface CreateTaskData {
  title: string;
  description?: string;
}
