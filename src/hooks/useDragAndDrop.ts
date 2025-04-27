// src/hooks/useDragAndDrop.ts
import { useState } from "react";
import { TaskStatus } from "../types/task";
import { toast } from "sonner";
import { useAuthStore } from "../store/authStore";

export function useDragAndDrop(
  onStatusChange: (taskId: string, status: TaskStatus) => void,
  onReorder: (
    draggedTaskId: string,
    targetTaskId: string,
    status: TaskStatus
  ) => void,
  columnStatus: TaskStatus
) {
  const { user } = useAuthStore();
  const [draggedOverTaskId, setDraggedOverTaskId] = useState<string | null>(
    null
  );
  const [isColumnDropTarget, setIsColumnDropTarget] = useState(false);

  // Handle dragging over a task or column
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsColumnDropTarget(true);

    const taskCard = (e.target as HTMLElement).closest(
      ".task-card"
    ) as HTMLElement;
    const taskId = taskCard?.getAttribute("data-task-id") || null;
    setDraggedOverTaskId(taskId);
  };

  // Handle dragging leaving the column area
  const handleDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsColumnDropTarget(false);
      setDraggedOverTaskId(null);
    }
  };

  // Handle dropping a task in the column
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsColumnDropTarget(false);
    setDraggedOverTaskId(null);

    const taskId = e.dataTransfer.getData("taskId");
    const sourceStatus = e.dataTransfer.getData("taskStatus") as TaskStatus;

    const taskCard = (e.target as HTMLElement).closest(
      ".task-card"
    ) as HTMLElement;
    const targetTaskId = taskCard?.getAttribute("data-task-id") || null;
    if (
      sourceStatus === columnStatus &&
      targetTaskId &&
      targetTaskId !== taskId
    ) {
      onReorder(taskId, targetTaskId, columnStatus);
      return;
    }

    if (sourceStatus !== columnStatus) {
      if (user?.role === "approver") {
        onStatusChange(taskId, columnStatus);
      } else {
        toast.error("Permission denied", {
          description: "Only approvers can change task status",
        });
      }
      return;
    }
  };

  return {
    draggedOverTaskId,
    isColumnDropTarget,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}
