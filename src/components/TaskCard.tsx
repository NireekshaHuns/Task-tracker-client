import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { taskService, TaskError } from "../services/taskService";
import { Task } from "../types/task";
import { Button } from "./ui/button";
import { Trash, Edit, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
}

/**
 * Card component to display individual task details and actions.
 * Supports editing, deleting, and drag-and-drop for approvers.
 */
const TaskCard = ({ task, onEdit }: TaskCardProps) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const maxTitleLength = 25;
  const maxDescriptionLength = 60;

  const truncatedTitle =
    task.title.length > maxTitleLength
      ? `${task.title.substring(0, maxTitleLength)}...`
      : task.title;

  const truncatedDescription =
    task.description && task.description.length > maxDescriptionLength
      ? `${task.description.substring(0, maxDescriptionLength)}...`
      : task.description;

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

  const deleteMutation = useMutation({
    mutationFn: () => taskService.deleteTask(task._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted successfully");
      setDialogOpen(false);
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
    if (user?.role !== "approver") {
      e.preventDefault();
      toast.error("Permission Denied", {
        description: "Only approvers can change task status",
      });
      return;
    }

    console.log("Starting drag for task ID:", task._id);

    e.dataTransfer.setData("taskId", task._id);
    e.dataTransfer.setData("taskStatus", task.status);
    e.dataTransfer.effectAllowed = "move";

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

  const handleCardClick = () => {
    // Only open dialog if not dragging
    if (!isDragging) {
      setDialogOpen(true);
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <>
      <div
        className={`bg-white dark:bg-gray-800 p-4 rounded-md shadow mb-3 border-l-4 ${getStatusColor()} 
          cursor-pointer transition-opacity duration-200
          ${isDragging ? "opacity-50" : "opacity-100"}`}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleCardClick}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-900 dark:text-white">
            {truncatedTitle}
          </h3>

          <div className="flex space-x-1">
            {canEdit && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={(e) => handleActionClick(e, () => onEdit?.(task))}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {canDelete && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-red-500 hover:text-red-700"
                onClick={(e) =>
                  handleActionClick(e, () => deleteMutation.mutate())
                }
                disabled={deleteMutation.isPending}
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {truncatedDescription && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
            {truncatedDescription}
          </p>
        )}

        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>
              {formatDistanceToNow(new Date(task.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <div>By: {task.createdBy.name}</div>
        </div>
      </div>

      {/* Dialog for full content */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{task.title}</DialogTitle>
          </DialogHeader>

          {task.description && (
            <div className="mt-4">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4 mr-1" />
              <span>
                Created{" "}
                {formatDistanceToNow(new Date(task.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Status:{" "}
              <span className="font-medium capitalize">{task.status}</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Created by: {task.createdBy.name}
            </div>
          </div>

          <DialogFooter className="mt-6">
            {canEdit && (
              <Button
                variant="outline"
                onClick={() => {
                  onEdit?.(task);
                  setDialogOpen(false);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {canDelete && (
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskCard;
