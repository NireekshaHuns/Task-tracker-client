import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authStore";
import { taskService, TaskError } from "../../services/taskService";
import { Task } from "../../types/task";
import { Button } from ".././ui/button";
import { Trash, Edit, RefreshCw, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter } from ".././ui/dialog";
import TaskCardContent from "./TaskCardContent";

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
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(data.message || "Task deleted successfully");
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

  // Get creator ID, handling different formats of createdBy data
  const getCreatedById = () => {
    if (typeof task.createdBy === "string") {
      return task.createdBy;
    } else if (
      task.createdBy &&
      typeof task.createdBy === "object" &&
      "_id" in task.createdBy
    ) {
      return task.createdBy._id;
    }
    return null;
  };

  // Get creator name, handling different formats of createdBy data
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

  const createdById = getCreatedById();
  const userId = user?._id;

  // Fixed permission checks with string conversion
  const canEdit =
    user?.role === "submitter" &&
    String(createdById) === String(userId) &&
    task.status === "pending";

  const canDelete = canEdit;

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
      <TaskCardContent
        task={task}
        truncatedTitle={truncatedTitle}
        truncatedDescription={truncatedDescription ?? null}
        isDragging={isDragging}
        className={className}
        getStatusColor={getStatusColor}
        getCreatedByName={getCreatedByName}
        canEdit={canEdit}
        canDelete={canDelete}
        handleActionClick={handleActionClick}
        onEdit={onEdit}
        deleteMutation={deleteMutation}
        handleDragStart={handleDragStart}
        handleDragEnd={handleDragEnd}
        handleCardClick={handleCardClick}
        {...props}
      />

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
