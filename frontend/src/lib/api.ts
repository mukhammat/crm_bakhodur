import axios, { AxiosInstance } from 'axios';
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
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async login(credentials: LoginCredentials) {
    const { data } = await this.client.post('/auth/login', credentials);
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  }

  async register(userData: RegisterData) {
    const { data } = await this.client.post('/auth/register', userData);
    return data;
  }

  logout() {
    localStorage.removeItem('token');
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
    const { data } = await this.client.post('/tasks', taskData);
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
    const { data } = await this.client.post('/tasks/assign-task-worker', assignmentData);
    return data;
  }

  async unassignTask(assignmentId: string) {
    const { data } = await this.client.delete(`/tasks/unassign-task-from-worker/${assignmentId}`);
    return data;
  }

  // User Roles
  async generateKey(role: string): Promise<string> {
    const { data } = await this.client.get(`/user-roles/generate-key/${role}`);
    return data.data.key;
  }
}

export const apiClient = new ApiClient();

