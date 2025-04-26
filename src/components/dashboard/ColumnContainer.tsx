// src/components/dashboard/ColumnContainer.tsx
import { useState, useEffect } from "react";
import { Task, TaskStatus } from "../../types/task";
import { TaskError } from "../../services/taskService";
import { useTaskStore } from "../../store/taskStore"; // Import the task store
import TaskColumn from "../TaskColumn";

interface ColumnContainerProps {
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onDrop: (taskId: string, status: TaskStatus) => void;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}

const ColumnContainer = ({
  tasks,
  onTaskEdit,
  onDrop,
  isLoading,
  isError,
  error,
}: ColumnContainerProps) => {
  // Get the refresh counter from the store to force re-renders
  const { getTasksByStatus, refreshCounter } = useTaskStore();

  // Derive tasks for each column directly from the store
  const pendingTasks = getTasksByStatus("pending");
  const approvedTasks = getTasksByStatus("approved");
  const doneTasks = getTasksByStatus("done");
  const rejectedTasks = getTasksByStatus("rejected");

  // Handle reordering within a column
  const handleReorder = (
    draggedTaskId: string,
    status: TaskStatus,
    targetIndex: number
  ) => {
    let columnTasks: Task[];

    // Select the right column tasks based on status
    switch (status) {
      case "pending":
        columnTasks = [...pendingTasks];
        break;
      case "approved":
        columnTasks = [...approvedTasks];
        break;
      case "done":
        columnTasks = [...doneTasks];
        break;
      case "rejected":
        columnTasks = [...rejectedTasks];
        break;
      default:
        return;
    }

    // Find the index of the dragged task
    const draggedIndex = columnTasks.findIndex((t) => t._id === draggedTaskId);

    if (draggedIndex === -1 || draggedIndex === targetIndex) return;

    // Create a new array to avoid mutating state directly
    const newTasks = [...columnTasks];

    // Remove dragged task
    const [draggedTask] = newTasks.splice(draggedIndex, 1);

    // Insert at target position
    newTasks.splice(targetIndex, 0, draggedTask);

    // Update state - for drag/drop reordering, we'll still use local state
    // This would need to be updated to also update the store if you implement
    // persistence of the ordering
  };

  // Track refresh counter to force re-renders
  const [_, setForceRender] = useState(0);
  useEffect(() => {
    setForceRender(refreshCounter);
  }, [refreshCounter]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <div className="ml-3 text-gray-500 dark:text-gray-400">
          Loading tasks...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex">
          <div>
            <p className="text-red-700 dark:text-red-300">
              Error loading tasks:{" "}
              {error instanceof TaskError ? error.message : "Unknown error"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <TaskColumn
        title="Pending"
        status="pending"
        tasks={pendingTasks}
        onTaskEdit={onTaskEdit}
        onDrop={onDrop}
        onReorder={handleReorder}
      />

      <TaskColumn
        title="Approved"
        status="approved"
        tasks={approvedTasks}
        onTaskEdit={onTaskEdit}
        onDrop={onDrop}
        onReorder={handleReorder}
      />

      <TaskColumn
        title="Done"
        status="done"
        tasks={doneTasks}
        onTaskEdit={onTaskEdit}
        onDrop={onDrop}
        onReorder={handleReorder}
      />

      <TaskColumn
        title="Rejected"
        status="rejected"
        tasks={rejectedTasks}
        onTaskEdit={onTaskEdit}
        onDrop={onDrop}
        onReorder={handleReorder}
      />
    </div>
  );
};

export default ColumnContainer;
