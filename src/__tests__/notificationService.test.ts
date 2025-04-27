import {
  notificationService,
  NotificationResponse,
} from "../services/notificationService";
import api from "../services/api";

// Mock API methods
jest.mock("../services/api", () => ({
  get: jest.fn(),
  delete: jest.fn(),
}));

describe("notificationService", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe("getNotifications", () => {
    // Test getting notifications successfully
    it("should fetch notifications successfully", async () => {
      const mockResponse: NotificationResponse = {
        notifications: [
          {
            _id: "notif-123",
            userId: "user-123",
            taskId: "task-123",
            taskTitle: "Test Task",
            message: "Your task was approved",
            actionType: "task_approved",
            actorName: "Approver",
            createdAt: new Date().toISOString(),
          },
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 20,
          pages: 1,
        },
      };

      (api.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await notificationService.getNotifications();

      expect(api.get).toHaveBeenCalledWith("/notifications");
      expect(result).toEqual(mockResponse);
      expect(result.notifications.length).toBe(1);
      expect(result.notifications[0].actionType).toBe("task_approved");
    });

    // Test error when API fails with a message
    it("should throw error when API request fails", async () => {
      (api.get as jest.Mock).mockRejectedValue({
        response: { data: { message: "Failed to load notifications" } },
      });

      await expect(notificationService.getNotifications()).rejects.toThrow();
      await expect(notificationService.getNotifications()).rejects.toThrow(
        "Failed to load notifications"
      );
    });

    // Test error when API fails without a message
    it("should throw generic error when API fails without message", async () => {
      (api.get as jest.Mock).mockRejectedValue({});

      await expect(notificationService.getNotifications()).rejects.toThrow(
        "Failed to fetch notifications"
      );
    });
  });

  describe("clearAllNotifications", () => {
    // Test clearing all notifications
    it("should clear all notifications successfully", async () => {
      (api.delete as jest.Mock).mockResolvedValue({
        data: { message: "All notifications cleared" },
      });

      await notificationService.clearAllNotifications();

      expect(api.delete).toHaveBeenCalledWith("/notifications/clear-all");
    });

    // Test error when clearing fails with a message
    it("should throw error when API request fails", async () => {
      (api.delete as jest.Mock).mockRejectedValue({
        response: { data: { message: "Permission denied" } },
      });

      await expect(
        notificationService.clearAllNotifications()
      ).rejects.toThrow();
      await expect(notificationService.clearAllNotifications()).rejects.toThrow(
        "Permission denied"
      );
    });

    // Test error when clearing fails without a message
    it("should throw generic error when API fails without message", async () => {
      (api.delete as jest.Mock).mockRejectedValue({});

      await expect(notificationService.clearAllNotifications()).rejects.toThrow(
        "Failed to clear notifications"
      );
    });
  });
});
