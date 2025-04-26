import { useState } from "react";
import { Task, TaskStatus } from "../../types/task";
import { useAuthStore } from "../../store/authStore";
import { toast } from "sonner";
import TaskCard from "./TaskCard"; // Added missing import

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
  onTaskEdit, // Added missing prop
  onDrop,
  onReorder,
}: TaskColumnProps) => {
  const { user } = useAuthStore();
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [draggedOverTaskId, setDraggedOverTaskId] = useState<string | null>(
    null
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();

    if (!isDropTarget) {
      setIsDropTarget(true);
    }

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

    const taskCard = (e.target as HTMLElement).closest(
      ".task-card"
    ) as HTMLElement;

    if (taskCard) {
      const targetTaskId = taskCard.getAttribute("data-task-id");

      const targetIndex = tasks.findIndex((t) => t._id === targetTaskId);

      if (sourceStatus === status && targetIndex !== -1) {
        onReorder(taskId, status, targetIndex);
        return;
      }
    }

    if (sourceStatus !== status) {
      if (user?.role === "approver") {
        onDrop(taskId, status);
      } else {
        toast.error("Permission Denied", {
          description: "Only approvers can change task status",
        });
      }
    } else {
      onReorder(taskId, status, tasks.length);
    }
  };

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
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='9' y1='9' x2='15' y2='15'%3E%3C/line%3E%3Cline x1='15' y1='9' x2='9' y2='15'%3E%3C/line%3E%3C/svg%3E";
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
