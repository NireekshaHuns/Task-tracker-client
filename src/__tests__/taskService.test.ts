import { taskService, TaskError } from "../services/taskService";
import api from "../services/api";
import { TaskStatus } from "../types/task";

// Mock the API module
jest.mock("../services/api", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

describe("taskService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getTasks", () => {
    it("should fetch all tasks when no status is provided", async () => {
      const mockTasks = [{ _id: "task1", title: "Test Task" }];
      (api.get as jest.Mock).mockResolvedValue({ data: mockTasks });

      const result = await taskService.getTasks();

      expect(api.get).toHaveBeenCalledWith("/tasks", { params: {} });
      expect(result).toEqual(mockTasks);
    });

    it("should fetch filtered tasks when status is provided", async () => {
      const mockTasks = [
        { _id: "task1", title: "Test Task", status: "pending" },
      ];
      (api.get as jest.Mock).mockResolvedValue({ data: mockTasks });

      const result = await taskService.getTasks("pending" as TaskStatus);

      expect(api.get).toHaveBeenCalledWith("/tasks", {
        params: { status: "pending" },
      });
      expect(result).toEqual(mockTasks);
    });

    it("should throw TaskError when API request fails", async () => {
      (api.get as jest.Mock).mockRejectedValue({
        response: { data: { message: "Failed to fetch tasks" } },
      });

      await expect(taskService.getTasks()).rejects.toThrow(TaskError);
      await expect(taskService.getTasks()).rejects.toThrow(
        "Failed to fetch tasks"
      );
    });
  });

  describe("deleteTask", () => {
    it("should delete a task and return success message", async () => {
      const successMessage = { message: "Task deleted successfully" };
      (api.delete as jest.Mock).mockResolvedValue({ data: successMessage });

      const result = await taskService.deleteTask("task-123");

      expect(api.delete).toHaveBeenCalledWith("/tasks/task-123");
      expect(result).toEqual(successMessage);
    });

    it("should throw TaskError when API request fails", async () => {
      (api.delete as jest.Mock).mockRejectedValue({
        response: { data: { message: "Task not found" } },
      });

      await expect(taskService.deleteTask("invalid-id")).rejects.toThrow(
        TaskError
      );
      await expect(taskService.deleteTask("invalid-id")).rejects.toThrow(
        "Task not found"
      );
    });
  });
});
