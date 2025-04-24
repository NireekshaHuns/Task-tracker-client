// src/components/dashboard/ColumnContainer.tsx
import { useState, useEffect } from "react";
import { Task, TaskStatus } from "../../types/task";
import { TaskError } from "../../services/taskService";
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
  // State to track tasks by status
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [approvedTasks, setApprovedTasks] = useState<Task[]>([]);
  const [doneTasks, setDoneTasks] = useState<Task[]>([]);
  const [rejectedTasks, setRejectedTasks] = useState<Task[]>([]);

  // Group tasks by status whenever they change
  useEffect(() => {
    if (tasks.length > 0) {
      setPendingTasks(tasks.filter((task) => task.status === "pending"));
      setApprovedTasks(tasks.filter((task) => task.status === "approved"));
      setDoneTasks(tasks.filter((task) => task.status === "done"));
      setRejectedTasks(tasks.filter((task) => task.status === "rejected"));
    }
  }, [tasks]);

  // Handle reordering within a column
  const handleReorder = (
    draggedTaskId: string,
    targetTaskId: string,
    status: TaskStatus
  ) => {
    let columnTasks: Task[];
    let setColumnTasks: React.Dispatch<React.SetStateAction<Task[]>>;

    // Select the right column state based on status
    switch (status) {
      case "pending":
        columnTasks = pendingTasks;
        setColumnTasks = setPendingTasks;
        break;
      case "approved":
        columnTasks = approvedTasks;
        setColumnTasks = setApprovedTasks;
        break;
      case "done":
        columnTasks = doneTasks;
        setColumnTasks = setDoneTasks;
        break;
      case "rejected":
        columnTasks = rejectedTasks;
        setColumnTasks = setRejectedTasks;
        break;
      default:
        return;
    }

    // Find indices
    const draggedIndex = columnTasks.findIndex((t) => t._id === draggedTaskId);
    const targetIndex = columnTasks.findIndex((t) => t._id === targetTaskId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Create a new array to avoid mutating state directly
    const newTasks = [...columnTasks];

    // Remove dragged task
    const [draggedTask] = newTasks.splice(draggedIndex, 1);

    // Insert at target position
    newTasks.splice(targetIndex, 0, draggedTask);

    // Update state
    setColumnTasks(newTasks);
  };

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

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="text-gray-500 dark:text-gray-400 mb-4">
          No tasks found
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
