// src/pages/Dashboard.tsx
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskService, TaskError } from '../services/taskService';
import { useAuthStore } from '../store/authStore';
import { Task, TaskStatus, CreateTaskData } from '../types/task';
import TaskColumn from '../components/TaskColumn';
import TaskForm from '../components/TaskForm';
import { Button } from '../components/ui/button';
import { Plus, LogOut } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner'; // Import from sonner

// Simple inline LoadingSpinner component
const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  
  // Fetch tasks with optional status filter
  const { data: tasks = [], isLoading, isError, error } = useQuery({
    queryKey: ['tasks', statusFilter],
    queryFn: () => 
      statusFilter === 'all' 
        ? taskService.getTasks() 
        : taskService.getTasks(statusFilter),
    retry: 1,
  });
  
  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsFormOpen(false);
      
      // Use Sonner toast
      toast.success('Task created successfully', {
        description: 'Your task has been added to the pending column'
      });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof TaskError 
        ? error.message 
        : 'Failed to create task';
      
      toast.error('Error', {
        description: errorMessage
      });
      
      // Also show toast for rate-limit errors
      if (errorMessage.includes('Too many task creation attempts')) {
        toast.error('Rate Limit Exceeded', {
          description: errorMessage
        });
      }
    },
  });
  
  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => 
      taskService.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setEditingTask(undefined);
      
      // Use Sonner toast
      toast.success('Task updated successfully');
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof TaskError 
        ? error.message 
        : 'Failed to update task';
      
      toast.error('Error', {
        description: errorMessage
      });
    },
  });
  
  // Group tasks by status
  const pendingTasks = tasks.filter((task) => task.status === 'pending');
  const approvedTasks = tasks.filter((task) => task.status === 'approved');
  const doneTasks = tasks.filter((task) => task.status === 'done');
  const rejectedTasks = tasks.filter((task) => task.status === 'rejected');
  
  // Handle drag and drop
  const handleDrop = (taskId: string, newStatus: TaskStatus) => {
    // Only approvers can change status (frontend check)
    if (user?.role !== 'approver') {
      toast.error('Permission Denied', {
        description: 'Only approvers can change task status'
      });
      return;
    }
    
    console.log(`Attempting to update task ${taskId} to status: ${newStatus}`);
    
    // Call the API to update the task status
    updateTaskMutation.mutate({ 
      id: taskId, 
      data: { status: newStatus } 
    });
  };
  
  // Handle task edit
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };
  
  // Handle form submission
  const handleTaskSubmit = (data: CreateTaskData) => {
    if (editingTask) {
      updateTaskMutation.mutate({ 
        id: editingTask._id, 
        data 
      });
    } else {
      createTaskMutation.mutate(data);
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully');
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Task Tracker</h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{user?.name}</span>
                <span className="px-2">|</span>
                <span className="capitalize">{user?.role}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-[180px]">
              <Select 
                value={statusFilter} 
                onValueChange={(value) => 
                  setStatusFilter(value as TaskStatus | 'all')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Only submitters can create tasks */}
          {user?.role === 'submitter' && (
            <Button 
              onClick={() => {
                setIsFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>
        
        {/* Error state */}
        {isError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div>
                <p className="text-red-700">
                  Error loading tasks: {error instanceof TaskError ? error.message : 'Unknown error'}
                </p>
                <p className="text-red-700 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })}
                  >
                    Retry
                  </Button>
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
            <div className="ml-3 text-gray-500">Loading tasks...</div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="text-gray-500 mb-4">No tasks found</div>
            {user?.role === 'submitter' && (
              <Button 
                onClick={() => setIsFormOpen(true)}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create your first task
              </Button>
            )}
          </div>
        ) : (
          // Kanban board
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pending column */}
            <TaskColumn
              title="Pending"
              status="pending"
              tasks={pendingTasks}
              onTaskEdit={handleEditTask}
              onDrop={handleDrop}
            />
            
            {/* Approved column */}
            <TaskColumn
              title="Approved"
              status="approved"
              tasks={approvedTasks}
              onTaskEdit={handleEditTask}
              onDrop={handleDrop}
            />
            
            {/* Done column */}
            <TaskColumn
              title="Done"
              status="done"
              tasks={doneTasks}
              onTaskEdit={handleEditTask}
              onDrop={handleDrop}
            />
            
            {/* Rejected column */}
            <TaskColumn
              title="Rejected"
              status="rejected"
              tasks={rejectedTasks}
              onTaskEdit={handleEditTask}
              onDrop={handleDrop}
            />
          </div>
        )}
      </main>
      
      {/* Task form dialog */}
      <TaskForm
        isOpen={isFormOpen || !!editingTask}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(undefined);
        }}
        onSubmit={handleTaskSubmit}
        initialData={editingTask}
        isSubmitting={
          createTaskMutation.isPending || updateTaskMutation.isPending
        }
      />
    </div>
  );
};

export default Dashboard;