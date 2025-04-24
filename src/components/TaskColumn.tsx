import { Task, TaskStatus } from "@/types/task";
import TaskCard from "./TaskCard";
import { useAuthStore } from "@/store/authStore";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onDrop: (taskId: string, status: TaskStatus) => void;
  onReorder: (
    draggedTaskId: string,
    targetTaskId: string,
    status: TaskStatus
  ) => void;
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

  const {
    draggedOverTaskId,
    isColumnDropTarget,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useDragAndDrop(onDrop, onReorder, status);

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

  const canAcceptDrops = user?.role === "approver" || status === "pending";

  return (
    <div
      className={`flex-1 min-w-[250px] ${getColumnStyle()} rounded-md p-3
        ${
          isColumnDropTarget
            ? "ring-2 ring-blue-400 dark:ring-blue-500 bg-opacity-70"
            : ""
        }`}
      onDragOver={canAcceptDrops ? handleDragOver : undefined}
      onDragLeave={canAcceptDrops ? handleDragLeave : undefined}
      onDrop={canAcceptDrops ? handleDrop : undefined}
      data-status={status}
    >
      <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 capitalize">
        {title}
      </h2>
      <div
        className={`space-y-3 min-h-[200px] ${
          isColumnDropTarget
            ? "bg-blue-50 dark:bg-blue-900/20 bg-opacity-50 rounded p-2 transition-all"
            : ""
        }`}
      >
        {tasks.length === 0 && (
          <div className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
            No tasks in this column
          </div>
        )}
        {tasks.map((task) => (
          <div
            key={task._id}
            className={`relative ${
              draggedOverTaskId === task._id
                ? "before:absolute before:left-0 before:right-0 before:top-0 before:h-1 before:bg-blue-500 before:rounded"
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
        ))}
      </div>
    </div>
  );
};

export default TaskColumn;
