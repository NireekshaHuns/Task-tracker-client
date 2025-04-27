import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskService, TaskError } from "../services/taskService";
import { useAuthStore } from "../store/authStore";
import { Task, TaskStatus, CreateTaskData } from "../types/task";
import { MainLayout } from "../components/layout/MainLayout";
import TaskColumn from "../components/TaskColumn";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner";
import usePageMeta from "@/hooks/usePageMeta";
import TaskForm from "@/components/tasks/TaskForm";

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};

const Dashboard = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  usePageMeta({
    title: "Dashboard",
    description:
      "Manage your tasks using our intuitive Kanban board interface.",
  });

  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [columnTasks, setColumnTasks] = useState({
    pending: [] as Task[],
    approved: [] as Task[],
    done: [] as Task[],
    rejected: [] as Task[],
  });

  // Fetch tasks with optional status filter
  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["tasks", statusFilter],
    queryFn: () =>
      statusFilter === "all"
        ? taskService.getTasks()
        : taskService.getTasks(statusFilter),
    retry: 1,
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setIsFormOpen(false);

      // Use Sonner toast
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

      // Also show specific message for rate-limit errors
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

      // Use Sonner toast
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

  // Handle drag and drop
  const handleDrop = (taskId: string, newStatus: TaskStatus) => {
    if (user?.role !== "approver") {
      toast.error("Permission Denied", {
        description: "Only approvers can change task status",
      });
      return;
    }

    // Call the API to update the task status
    updateTaskMutation.mutate({
      id: taskId,
      data: { status: newStatus },
    });
  };

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

  const handleReorder = (
    taskId: string,
    status: TaskStatus,
    targetIndex: number
  ) => {
    const currentTasks = [...columnTasks[status]];

    const taskIndex = currentTasks.findIndex((t) => t._id === taskId);
    if (taskIndex === -1) return;

    const [movedTask] = currentTasks.splice(taskIndex, 1);

    currentTasks.splice(targetIndex, 0, movedTask);

    setColumnTasks({
      ...columnTasks,
      [status]: currentTasks,
    });
  };

  useEffect(() => {
    if (tasks.length === 0) {
      setColumnTasks({
        pending: [],
        approved: [],
        done: [],
        rejected: [],
      });
    }
  }, [tasks.length === 0 ? "empty" : "non-empty"]);

  useEffect(() => {
    if (tasks.length > 0) {
      setColumnTasks({
        pending: tasks.filter((task) => task.status === "pending"),
        approved: tasks.filter((task) => task.status === "approved"),
        done: tasks.filter((task) => task.status === "done"),
        rejected: tasks.filter((task) => task.status === "rejected"),
      });
    }
  }, [tasks]);

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

        {user?.role === "submitter" && (
          <Button
            onClick={() => {
              setIsFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        )}
      </div>

      {/* Error state */}
      {isError && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div>
              <p className="text-red-700 dark:text-red-300">
                Error loading tasks:{" "}
                {error instanceof TaskError ? error.message : "Unknown error"}
              </p>
              <p className="text-red-700 dark:text-red-300 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    queryClient.invalidateQueries({ queryKey: ["tasks"] })
                  }
                >
                  Retry
                </Button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
          <div className="ml-3 text-gray-500 dark:text-gray-400">
            Loading tasks...
          </div>
        </div>
      ) : (
        // Kanban board
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pending column */}
          <TaskColumn
            title="Pending"
            status="pending"
            tasks={columnTasks.pending}
            onTaskEdit={handleEditTask}
            onDrop={handleDrop}
            onReorder={handleReorder}
          />

          {/* Approved column */}
          <TaskColumn
            title="Approved"
            status="approved"
            tasks={columnTasks.approved}
            onTaskEdit={handleEditTask}
            onDrop={handleDrop}
            onReorder={handleReorder}
          />

          {/* Done column */}
          <TaskColumn
            title="Done"
            status="done"
            tasks={columnTasks.done}
            onTaskEdit={handleEditTask}
            onDrop={handleDrop}
            onReorder={handleReorder}
          />

          {/* Rejected column */}
          <TaskColumn
            title="Rejected"
            status="rejected"
            tasks={columnTasks.rejected}
            onTaskEdit={handleEditTask}
            onDrop={handleDrop}
            onReorder={handleReorder}
          />
        </div>
      )}

      {/* Task form dialog */}
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

export default Dashboard;
