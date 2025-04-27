import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskService, TaskError } from "../../services/taskService";
import { useAuthStore } from "../../store/authStore";
import { useTaskStore } from "../../store/taskStore";
import { Task, TaskStatus, CreateTaskData } from "../../types/task";
import ColumnContainer from "./ColumnContainer";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import { MainLayout } from "../layout/MainLayout";
import TaskForm from "../tasks/TaskForm";

const DashboardPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Get task store methods
  const { tasks: storeTasks, setTasks, refreshCounter } = useTaskStore();

  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  // Fetch tasks with optional status filter
  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["tasks", statusFilter, refreshCounter],
    queryFn: () =>
      statusFilter === "all"
        ? taskService.getTasks()
        : taskService.getTasks(statusFilter),
    retry: 1,
  });

  // Sync fetched tasks with the store
  useEffect(() => {
    if (tasks) {
      setTasks(tasks);
    }
  }, [tasks, setTasks]);

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setIsFormOpen(false);

      toast.success("Task created successfully", {
        description: "Your task has been added to the pending column",
      });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof TaskError ? error.message : "Failed to create task";

      toast.error("Error", {
        description: errorMessage,
      });

      if (errorMessage.includes("Too many task creation attempts")) {
        toast.error("Rate Limit Exceeded", {
          description: errorMessage,
        });
      }
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
      taskService.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setEditingTask(undefined);

      toast.success("Task updated successfully");
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof TaskError ? error.message : "Failed to update task";

      toast.error("Error", {
        description: errorMessage,
      });
    },
  });

  // Handle task edit
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  // Handle form submission
  const handleTaskSubmit = (data: CreateTaskData) => {
    if (editingTask) {
      updateTaskMutation.mutate({
        id: editingTask._id,
        data,
      });
    } else {
      createTaskMutation.mutate(data);
    }
  };

  // Handle status change via drag and drop
  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTaskMutation.mutate({
      id: taskId,
      data: { status: newStatus },
    });
  };

  return (
    <MainLayout title="Task Tracker">
      {/* Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-[180px]">
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as TaskStatus | "all")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Only submitters can create tasks */}
        {user?.role === "submitter" && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        )}
      </div>

      {/* Kanban board */}
      <ColumnContainer
        tasks={storeTasks}
        onTaskEdit={handleEditTask}
        onDrop={handleStatusChange}
        isLoading={isLoading}
        isError={isError}
        error={error}
      />

      <TaskForm
        isOpen={isFormOpen || !!editingTask}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(undefined);
        }}
        onSubmit={handleTaskSubmit}
        initialData={editingTask}
        isSubmitting={
          createTaskMutation.isPending || updateTaskMutation.isPending
        }
      />
    </MainLayout>
  );
};

export default DashboardPage;
