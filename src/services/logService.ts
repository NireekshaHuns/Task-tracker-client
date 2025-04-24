import api from './api';

export interface Log {
  _id: string;
  taskId: string;
  taskTitle: string;
  userId: string;
  userName: string;
  fromStatus?: string;
  toStatus: string;
  timestamp: string;
  action: 'create' | 'update' | 'delete' | 'status_change';
}

export interface LogFilters {
  taskId?: string;
  userId?: string;
  action?: string;
  fromStatus?: string;
  toStatus?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
}

export interface LogsResponse {
  logs: Log[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const logService = {
  getLogs: async (filters: LogFilters = {}): Promise<LogsResponse> => {
    try {
      // Convert filters to URL params
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
      
      const response = await api.get<LogsResponse>(`/logs?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch logs';
      throw new Error(errorMessage);
    }
  }
};