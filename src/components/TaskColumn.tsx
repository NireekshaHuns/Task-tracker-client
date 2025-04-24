// src/components/TaskColumn.tsx
import { useState } from 'react';
import { Task, TaskStatus } from '../types/task';
import TaskCard from './TaskCard';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onDrop: (taskId: string, status: TaskStatus) => void;
}

const TaskColumn = ({ 
  title, 
  status, 
  tasks, 
  onTaskEdit, 
  onDrop 
}: TaskColumnProps) => {
  const { user } = useAuthStore();
  const [isDropTarget, setIsDropTarget] = useState(false);
  
  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    // Always prevent default to allow dropping
    e.preventDefault();
    
    if (!isDropTarget) {
      setIsDropTarget(true);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    // Check if the drag is leaving the container and not entering a child
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (
      x < rect.left || 
      x >= rect.right || 
      y < rect.top || 
      y >= rect.bottom
    ) {
      setIsDropTarget(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropTarget(false);
    
    // Get the task ID from the data transfer
    const taskId = e.dataTransfer.getData('taskId');
    console.log('Dropping task with ID:', taskId); // Debug log
    
    // Validate that we have a task ID
    if (!taskId) {
      toast.error('Error', {
        description: 'Invalid task ID'
      });
      return;
    }
    
    // If user is not an approver, show error
    if (user?.role !== 'approver') {
      toast.error('Permission Denied', {
        description: 'Only approvers can change task status'
      });
      return;
    }
    
    // Let the backend handle the validation logic
    onDrop(taskId, status);
  };
  
  // Define column styling based on status
  const getColumnStyle = () => {
    switch (status) {
      case 'pending': return 'bg-yellow-50';
      case 'approved': return 'bg-green-50';
      case 'done': return 'bg-blue-50';
      case 'rejected': return 'bg-red-50';
      default: return 'bg-gray-50';
    }
  };
  
  // Is the user an approver who can drag to this column
  const isApprover = user?.role === 'approver';
  
  return (
    <div 
      className={`flex-1 min-w-[250px] ${getColumnStyle()} rounded-md p-3
        ${isDropTarget && isApprover ? 'ring-2 ring-blue-400 bg-opacity-70' : ''}`}
      onDragOver={isApprover ? handleDragOver : undefined}
      onDragLeave={isApprover ? handleDragLeave : undefined}
      onDrop={isApprover ? handleDrop : undefined}
      data-status={status}
    >
      <h2 className="font-semibold text-gray-700 mb-3 capitalize">{title}</h2>
      <div 
        className={`space-y-3 min-h-[200px] ${isDropTarget && isApprover ? 'bg-blue-50 bg-opacity-50 rounded p-2 transition-all' : ''}`}
      >
        {tasks.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-8">
            No tasks in this column
          </div>
        )}
        {tasks.map((task) => (
          <TaskCard 
            key={task._id} 
            task={task} 
            onEdit={onTaskEdit} 
          />
        ))}
      </div>
    </div>
  );
};

export default TaskColumn;