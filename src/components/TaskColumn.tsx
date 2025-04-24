// src/components/TaskColumn.tsx
import { useState } from "react";
import { Task, TaskStatus } from "../types/task";
import TaskCard from "./TaskCard";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onDrop: (taskId: string, status: TaskStatus) => void;
  onReorder: (taskId: string, status: TaskStatus, targetIndex: number) => void;
}

const TaskColumn = ({
  title,
  status,
  tasks,
  onTaskEdit,
  onDrop,
  onReorder,
}: TaskColumnProps) => {
  const { user } = useAuthStore();
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [draggedOverTaskId, setDraggedOverTaskId] = useState<string | null>(
    null
  );

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();

    if (!isDropTarget) {
      setIsDropTarget(true);
    }

    // Find the closest task-card element
    const taskCard = (e.target as HTMLElement).closest(
      ".task-card"
    ) as HTMLElement;
    if (taskCard) {
      const taskId = taskCard.getAttribute("data-task-id");
      setDraggedOverTaskId(taskId);
    } else {
      setDraggedOverTaskId(null);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDropTarget(false);
      setDraggedOverTaskId(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropTarget(false);
    setDraggedOverTaskId(null);

    const taskId = e.dataTransfer.getData("taskId");
    const sourceStatus = e.dataTransfer.getData("taskStatus") as TaskStatus;

    // Find the task element being dropped on
    const taskCard = (e.target as HTMLElement).closest(
      ".task-card"
    ) as HTMLElement;

    // Case 1: If dropped directly on a task card
    if (taskCard) {
      const targetTaskId = taskCard.getAttribute("data-task-id");

      // Find target index
      const targetIndex = tasks.findIndex((t) => t._id === targetTaskId);

      // If source and target columns are the same, reorder
      if (sourceStatus === status && targetIndex !== -1) {
        onReorder(taskId, status, targetIndex);
        return;
      }
    }

    // Case 2: If dropped at the end of the column or on different status column
    if (sourceStatus !== status) {
      // Handle regular status change
      if (user?.role === "approver") {
        onDrop(taskId, status);
      } else {
        toast.error("Permission Denied", {
          description: "Only approvers can change task status",
        });
      }
    } else {
      // Dropped at the end of the same column
      onReorder(taskId, status, tasks.length);
    }
  };

  // Define column styling based on status
  const getColumnStyle = () => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 dark:bg-yellow-900/20";
      case "approved":
        return "bg-green-50 dark:bg-green-900/20";
      case "done":
        return "bg-blue-50 dark:bg-blue-900/20";
      case "rejected":
        return "bg-red-50 dark:bg-red-900/20";
      default:
        return "bg-gray-50 dark:bg-gray-800";
    }
  };

  const getEmptyStateImage = () => {
    switch (status) {
      case "pending":
        return "/src/assets/pending.png";
      case "approved":
        return "/src/assets/approved.png";
      case "done":
        return "/src/assets/done.png";
      case "rejected":
        return "/src/assets/rejected.png";
      default:
        return "/src/assets/pending.png";
    }
  };

  return (
    <div
      className={`flex-1 min-w-[250px] ${getColumnStyle()} rounded-md p-3
        ${
          isDropTarget
            ? "ring-2 ring-blue-400 dark:ring-blue-500 bg-opacity-70"
            : ""
        }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-status={status}
    >
      <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 capitalize">
        {title}
      </h2>
      <div
        className={`space-y-3 min-h-[200px] ${
          isDropTarget
            ? "bg-blue-50 dark:bg-blue-900/20 bg-opacity-50 rounded p-2 transition-all"
            : ""
        }`}
      >
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 mb-3">
              <img
                src={getEmptyStateImage()}
                alt={`No ${status} tasks`}
                className="w-full h-full object-contain opacity-60"
                onError={(e) => {
                  (
                    e.target as HTMLImageElement
                  ).src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' fill='none' viewBox='0 0 24 24' stroke='%239ca3af' stroke-width='1'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' /%3E%3C/svg%3E`;
                }}
              />
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              No tasks in this column
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className={`relative ${
                draggedOverTaskId === task._id
                  ? "before:absolute before:inset-x-0 before:top-[-6px] before:h-1 before:bg-blue-500 before:rounded-full"
                  : ""
              }`}
            >
              <TaskCard
                task={task}
                onEdit={onTaskEdit}
                className="task-card"
                data-task-id={task._id}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskColumn;
