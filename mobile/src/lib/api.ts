import axios, { AxiosInstance } from 'axios';
import { storage } from './storage';
import { 
  API_BASE_URL, 
  LoginCredentials, 
  RegisterData, 
  User, 
  Task, 
  CreateTaskData, 
  UpdateTaskData,
  UpdateUserData,
  AssignTaskData,
  TaskStatus,
  UserRole,
  Permission,
} from '../config/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.client.interceptors.request.use(async (config) => {
      const token = await storage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // Логирование для отладки
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // Handle errors
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[API] Response ${response.status} ${response.config.url}`);
        return response;
      },
      async (error) => {
        console.error('[API] Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        });
        if (error.response?.status === 401) {
          await storage.removeItem('token');
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async login(credentials: LoginCredentials) {
    const { data } = await this.client.post('/auth/login', credentials);
    if (data.token) {
      await storage.setItem('token', data.token);
    }
    return data;
  }

  async register(userData: RegisterData) {
    const { data } = await this.client.post('/auth/register', userData);
    return data;
  }

  async logout() {
    await storage.removeItem('token');
  }

  // Users
  async getCurrentUser(): Promise<User> {
    const { data } = await this.client.get('/users/me');
    return data.user;
  }

  async getUsers(roleId?: number): Promise<User[]> {
    const params = roleId ? { roleId } : {};
    const { data } = await this.client.get('/users', { params });
    return data.users;
  }

  async updateUser(userData: UpdateUserData) {
    const { data } = await this.client.put('/users', userData);
    return data;
  }

  async deleteUser(userId: string) {
    const { data } = await this.client.delete(`/users/${userId}`);
    return data;
  }

  // Tasks
  async createTask(taskData: CreateTaskData): Promise<Task> {
    const { assigneeId, ...taskPayload } = taskData;
    const { data } = await this.client.post('/tasks', taskPayload);
    
    if (assigneeId && data.task?.id) {
      try {
        await this.assignTask({
          taskId: data.task.id,
          userId: assigneeId
        });
      } catch (error) {
        console.error('Failed to assign task:', error);
      }
    }
    
    return data.task;
  }

  async getTasks(params?: Record<string, any>): Promise<Task[]> {
    const { data } = await this.client.get('/tasks', { params });
    return data.tasks;
  }

  async getTaskById(id: string): Promise<Task> {
    const { data } = await this.client.get(`/tasks/${id}`);
    return data.task;
  }

  async updateTask(id: string, taskData: UpdateTaskData): Promise<Task> {
    const { data } = await this.client.put(`/tasks/${id}`, taskData);
    return data.task;
  }

  async deleteTask(id: string) {
    const { data } = await this.client.delete(`/tasks/${id}`);
    return data;
  }

  async assignTask(assignmentData: AssignTaskData) {
    const { data } = await this.client.post('/task-assignments', assignmentData);
    return data;
  }

  async unassignTask(assignmentId: string) {
    const { data } = await this.client.delete(`/task-assignments/${assignmentId}`);
    return data;
  }

  // User Roles
  async generateKey(role: string): Promise<string> {
    const { data } = await this.client.get(`/user-roles/generate-key/${role}`);
    return data.data.key;
  }

  async getUserRoles(): Promise<UserRole[]> {
    const { data } = await this.client.get('/user-roles');
    return data.userRoles;
  }

  async createUserRole(title: string): Promise<UserRole> {
    const { data } = await this.client.post('/user-roles', { title });
    return data.userRole;
  }

  async updateUserRole(id: number, title: string): Promise<UserRole> {
    const { data } = await this.client.put(`/user-roles/${id}`, { title });
    return data.userRole;
  }

  async deleteUserRole(id: number) {
    const { data } = await this.client.delete(`/user-roles/${id}`);
    return data;
  }

  // Task Statuses
  async getTaskStatuses(): Promise<TaskStatus[]> {
    const { data } = await this.client.get('/task-statuses');
    return data.taskStatuses;
  }

  async createTaskStatus(title: string): Promise<TaskStatus> {
    const { data } = await this.client.post('/task-statuses', { title });
    return data.taskStatus;
  }

  async updateTaskStatus(id: number, title: string): Promise<TaskStatus> {
    const { data } = await this.client.put(`/task-statuses/${id}`, { title });
    return data.taskStatus;
  }

  async deleteTaskStatus(id: number) {
    const { data } = await this.client.delete(`/task-statuses/${id}`);
    return data;
  }

  // Permissions
  async getPermissions(): Promise<Permission[]> {
    const { data } = await this.client.get('/permissions');
    return data.permissions;
  }

  async createPermission(title: string): Promise<Permission> {
    const { data } = await this.client.post('/permissions', { title });
    return data.permission;
  }

  async updatePermission(id: string, title: string): Promise<Permission> {
    const { data } = await this.client.put(`/permissions/${id}`, { title });
    return data.permission;
  }

  async deletePermission(id: string) {
    const { data } = await this.client.delete(`/permissions/${id}`);
    return data;
  }

  // Role Permissions
  async getRolePermissions(roleId: number): Promise<Permission[]> {
    const { data } = await this.client.get(`/role-permissions/${roleId}`);
    return data.permissions;
  }

  async assignPermissionToRole(roleId: number, permissionId: string) {
    const { data } = await this.client.post(`/role-permissions/${roleId}`, { permissionId });
    return data;
  }

  async removePermissionFromRole(roleId: number, permissionId: string) {
    const { data } = await this.client.delete(`/role-permissions/${roleId}`, {
      data: { permissionId }
    });
    return data;
  }

  // User Permissions (for current user via role)
  async getMyRolePermissions() {
    const { data } = await this.client.get('/role-permissions/me');
    return data;
  }
}

export const apiClient = new ApiClient();

