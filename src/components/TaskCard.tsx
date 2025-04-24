// src/components/TaskCard.tsx
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { taskService, TaskError } from "../services/taskService";
import { Task } from "../types/task";
import { Button } from "./ui/button";
import { Trash, Edit, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner"; // Import from sonner

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
}

const TaskCard = ({ task, onEdit }: TaskCardProps) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);

  // Get status-specific styling
  const getStatusColor = () => {
    switch (task.status) {
      case "pending":
        return "border-l-yellow-500";
      case "approved":
        return "border-l-green-500";
      case "done":
        return "border-l-blue-500";
      case "rejected":
        return "border-l-red-500";
      default:
        return "border-l-gray-500";
    }
  };

  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: () => taskService.deleteTask(task._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted successfully");
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof TaskError ? error.message : "Failed to delete task";

      toast.error("Error", {
        description: errorMessage,
      });
    },
  });

  // Handle drag events
  const handleDragStart = (e: React.DragEvent) => {
    // If submitter tries to drag a card, stop them with a message
    if (user?.role !== "approver") {
      e.preventDefault();
      toast.error("Permission Denied", {
        description: "Only approvers can change task status",
      });
      return;
    }

    console.log("Starting drag for task ID:", task._id); // Debug log

    e.dataTransfer.setData("taskId", task._id);
    e.dataTransfer.setData("taskStatus", task.status);
    e.dataTransfer.effectAllowed = "move";

    // Add a slight delay to trigger the dragging visual effect
    setTimeout(() => {
      setIsDragging(true);
    }, 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Check if user can edit this task
  const canEdit =
    user?.role === "submitter" &&
    task.createdBy._id === user.id &&
    task.status === "pending";

  // Check if user can delete this task
  const canDelete =
    user?.role === "submitter" &&
    task.createdBy._id === user.id &&
    task.status === "pending";

  return (
    <div
      className={`bg-white dark:bg-gray-800 p-4 rounded-md shadow mb-3 border-l-4 ${getStatusColor()}} 
    transition-opacity duration-200
    ${isDragging ? "opacity-50" : "opacity-100"}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900 dark:text-white">
          {task.title}
        </h3>

        {/* Task actions */}
        <div className="flex space-x-1">
          {canEdit && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => onEdit?.(task)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {canDelete && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-red-500 hover:text-red-700"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Task description */}
      {task.description && (
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
          {task.description}
        </p>
      )}

      {/* Task metadata */}
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          <span>
            {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
          </span>
        </div>
        <div>By: {task.createdBy.name}</div>
      </div>
    </div>
  );
};

export default TaskCard;
