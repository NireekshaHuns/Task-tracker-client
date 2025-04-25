import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { taskService, TaskError } from "../services/taskService";
import { Task } from "../types/task";
import { Button } from "./ui/button";
import { Trash, Edit, Clock, UserCircle2Icon, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter } from "./ui/dialog";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  className?: string;
}

const TaskCard = ({
  task,
  onEdit,
  className = "",
  ...props
}: TaskCardProps & React.HTMLAttributes<HTMLDivElement>) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Truncate title and description for card view
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
    onSuccess: (data) => {
      // Close dialog first
      setDialogOpen(false);

      // Force a clean reload of the data
      queryClient.resetQueries({ queryKey: ["tasks"] });
      queryClient.refetchQueries({ queryKey: ["tasks"] });

      toast.success(data.message || "Task deleted successfully");
    },
    // ...
  });

  const handleDragStart = (e: React.DragEvent) => {
    // Prevent dialog from opening when starting drag
    e.stopPropagation();

    if (user?.role !== "approver") {
      e.preventDefault();
      toast.error("Permission Denied", {
        description: "Only approvers can change task status",
      });
      return;
    }

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

  const getCreatedByName = () => {
    if (
      typeof task.createdBy === "object" &&
      task.createdBy &&
      "name" in task.createdBy
    ) {
      return task.createdBy.name;
    }
    return "Unknown";
  };

  const canEdit =
    user?.role === "submitter" &&
    (typeof task.createdBy === "object"
      ? String(task.createdBy._id) === String(user._id || user._id)
      : String(task.createdBy) === String(user._id || user._id)) &&
    task.status === "pending";

  const canDelete = canEdit; // Same logic for delete

  const handleCardClick = () => {
    if (!isDragging) {
      setDialogOpen(true);
    }
  };

  // Handle action button clicks
  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <>
      <div
        className={`bg-white dark:bg-gray-800 p-4 rounded-md shadow mb-3 border-l-4 ${getStatusColor()} 
          cursor-pointer transition-opacity duration-200
          ${isDragging ? "opacity-50" : "opacity-100"} ${className}`}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleCardClick}
        {...props}
      >
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
          {truncatedTitle}
        </h3>

        {truncatedDescription && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
            {truncatedDescription}
          </p>
        )}

        <div className="flex flex-col text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>
              {formatDistanceToNow(new Date(task.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <div className="flex items-center">
              <UserCircle2Icon className="h-3 w-3 mr-1" />
              <span>{getCreatedByName()}</span>
            </div>

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
        </div>
      </div>

      {/* Dialog popup for full task details */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <div>
            <h2 className="text-xl font-bold mb-2">{task.title}</h2>

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {task.description}
            </p>

            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Created{" "}
                {formatDistanceToNow(new Date(task.createdAt), {
                  addSuffix: true,
                })}
              </p>
              <p>
                Status: <span className="capitalize">{task.status}</span>
              </p>
              <p>Created by: {getCreatedByName()}</p>
              {task.updatedBy && (
                <p className="flex items-center">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Last updated by{" "}
                  {typeof task.updatedBy === "object" &&
                  "name" in task.updatedBy
                    ? task.updatedBy.name
                    : "Unknown"}{" "}
                  {task.updatedAt &&
                    formatDistanceToNow(new Date(task.updatedAt), {
                      addSuffix: true,
                    })}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex space-x-2 mt-6">
            {canEdit && (
              <Button
                variant="outline"
                className="flex items-center"
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
                className="flex items-center"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}

            <Button onClick={() => setDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskCard;
