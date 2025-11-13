// Измените этот URL на адрес вашего бэкенда
export const API_BASE_URL = 'http://45.63.43.62:3322/api';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  roleId: number;
  isActive: boolean;
  telegramId?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  statusId: number;
  createdAt: string;
  dueDate?: string;
  createdBy: string;
  assignments?: Array<{
    id: string;
    taskId: string;
    userId: string;
    user?: {
      id: string;
      name: string;
    };
  }>;
}

export interface TaskStatus {
  id: number;
  title: string;
}

export interface UserRole {
  id: number;
  title: string;
}

export interface Permission {
  id: string;
  title: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  key: string;
  telegramId?: number;
}

export interface CreateTaskData {
  title: string;
  description: string;
  statusId?: number;
  dueDate?: string;
  assigneeId?: string;
}

export interface UpdateTaskData extends CreateTaskData {}

export interface UpdateUserData {
  name?: string;
  email?: string;
  isActive?: boolean;
}

export interface AssignTaskData {
  taskId: string;
  userId: string;
}

