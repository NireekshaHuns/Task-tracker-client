import React, { useState } from "react";
import {
  Clock,
  UserCircle2Icon,
  Edit,
  Trash,
  Loader2,
  Sparkles,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from ".././ui/button";
import { Task } from "../../types/task";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from ".././ui/tooltip";
import { generateTLDR } from "../utils/aiDescription";

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
  deleteMutation: any;
  handleDragStart: (e: React.DragEvent) => void;
  handleDragEnd: () => void;
  handleCardClick: () => void;
}

// Task card content displaying title, description, and actions
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
  const [tldrSummary, setTldrSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const handleGenerateTldr = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isDragging) return;

    setTooltipOpen(!tooltipOpen);

    if (
      tldrSummary ||
      isGeneratingSummary ||
      !task.description ||
      task.description.length < 30
    ) {
      return;
    }

    setIsGeneratingSummary(true);

    try {
      const summary = await generateTLDR(task.description);
      setTldrSummary(summary);
    } catch (error) {
      setTldrSummary("Unable to generate summary");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 p-4 rounded-md shadow mb-3 border-l-4 ${getStatusColor()} 
        cursor-pointer transition-opacity duration-200
        ${isDragging ? "opacity-50" : "opacity-100"} ${className}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={() => {
        handleDragEnd();
        setTooltipOpen(false);
      }}
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
            {task.description && task.description.length >= 30 && (
              <TooltipProvider>
                <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-blue-500"
                      onClick={handleGenerateTldr}
                      disabled={isDragging}
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="w-[300px] p-4 bg-[#251d1d] dark:bg-[#111827] text-white light:text-gray-800 border-none shadow-lg"
                    sideOffset={5}
                  >
                    <div className="space-y-3">
                      <h4 className="font-bold text-lg dark:text-white light:text-gray-900">
                        AI Summary ✨
                      </h4>
                      {isGeneratingSummary ? (
                        <div className="flex items-center py-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span className="text-sm">Generating summary...</span>
                        </div>
                      ) : (
                        <p className="dark:text-white light:text-black text-sm leading-relaxed">
                          {tldrSummary || "Summary not available"}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

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
