import React from "react";
import { Clock, UserCircle2Icon, Edit, Trash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from ".././ui/button";
import { Task } from "../../types/task";

interface TaskCardContentProps {
  task: Task;
  truncatedTitle: string;
  truncatedDescription: string | null | undefined;
  isDragging: boolean;
  className?: string;
  getStatusColor: () => string;
  getCreatedByName: () => string;
  canEdit: boolean;
  canDelete: boolean;
  handleActionClick: (e: React.MouseEvent, action: () => void) => void;
  onEdit?: (task: Task) => void;
  deleteMutation: any; // You might want to type this properly
  handleDragStart: (e: React.DragEvent) => void;
  handleDragEnd: () => void;
  handleCardClick: () => void;
}

const TaskCardContent: React.FC<TaskCardContentProps> = ({
  task,
  truncatedTitle,
  truncatedDescription,
  isDragging,
  className = "",
  getStatusColor,
  getCreatedByName,
  canEdit,
  canDelete,
  handleActionClick,
  onEdit,
  deleteMutation,
  handleDragStart,
  handleDragEnd,
  handleCardClick,
  ...props
}) => {
  return (
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
  );
};

export default TaskCardContent;
