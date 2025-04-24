// src/services/authService.ts
import api from './api';
import { AuthResponse, LoginCredentials, RegisterData } from '../types/user';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      throw new Error(errorMessage);
    }
  },
  
  register: async (data: RegisterData): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>('/auth/register', data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  },
};