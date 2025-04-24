import { Task, TaskStatus } from '../types/task';
import TaskCard from './TaskCard';
import { useAuthStore } from '../store/authStore';

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
  
  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
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
  
  // Check if this column should be droppable (based on role and column)
  const isDroppable = () => {
    if (user?.role !== 'approver') return false;
    
    // Approvers can move tasks to these statuses based on the task's current status
    return true;
  };
  
  return (
    <div 
      className={`flex-1 min-w-[250px] ${getColumnStyle()} rounded-md p-3`}
      onDragOver={isDroppable() ? handleDragOver : undefined}
      onDrop={isDroppable() ? handleDrop : undefined}
    >
      <h2 className="font-semibold text-gray-700 mb-3 capitalize">{title}</h2>
      <div className="space-y-3 min-h-[200px]">
        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onEdit={onTaskEdit} 
          />
        ))}
      </div>
    </div>
  );
};

export default TaskColumn;