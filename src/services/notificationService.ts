import api from "./api";

export interface Notification {
  _id: string;
  userId: string;
  taskId: string;
  taskTitle: string;
  message: string;
  actionType: "task_approved" | "task_rejected" | "task_done";
  actorName: string;
  createdAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const notificationService = {
  getNotifications: async (): Promise<NotificationResponse> => {
    try {
      const response = await api.get<NotificationResponse>("/notifications");
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch notifications";
      throw new Error(errorMessage);
    }
  },

  clearAllNotifications: async (): Promise<void> => {
    try {
      await api.delete("/notifications/clear-all");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to clear notifications";
      throw new Error(errorMessage);
    }
  },
};
