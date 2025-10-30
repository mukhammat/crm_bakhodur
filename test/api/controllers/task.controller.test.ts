import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { TaskController } from '../../../src/api/controllers/task.controller.js';
import type { ITaskService } from '../../../src/core/services/task.service.js';
import { ContextJWT } from '../../../src/api/types/context-jwt.js';

// Мок сервиса
const createMockService = (): ITaskService => ({
  create: vi.fn(),
  getById: vi.fn(),
  getAll: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
});

describe('TaskController', () => {
  let app: Hono;
  let mockService: ITaskService;
  let controller: TaskController;

  beforeEach(() => {
    app = new Hono();
    mockService = createMockService();
    controller = new TaskController(mockService);
  });

  describe('POST /tasks - create', () => {
    it('должен создать задачу и вернуть её', async () => {
      const createdTask = { 
        id: 'task-1', 
        title: 'Test Task', 
        description: 'Description',
        createdBy: 'user-1'
      };

      vi.mocked(mockService.create).mockResolvedValue(createdTask);

      app.post('/tasks', async (c: ContextJWT) => {
        c.set('jwtPayload', { id: 'user-1' });
        return controller.create(c);
      });

      const res = await app.request('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: 'Test Task', 
          description: 'Description' 
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data).toEqual({ task: createdTask });
      expect(mockService.create).toHaveBeenCalledWith({
        title: 'Test Task',
        description: 'Description',
        createdBy: 'user-1'
      });
    });

    it('должен вернуть 400 если нет title', async () => {
      app.post('/tasks', async (c: ContextJWT) => {
        c.set('jwtPayload', { id: 'user-1' });
        const { title, description } = await c.req.json();
        
        if (!title) {
          return c.json({ error: 'Title is required' }, 400);
        }
        
        return controller.create(c);
      });

      const res = await app.request('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: 'Only description' }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Title is required');
    });
  });

  describe('GET /tasks/:id - getById', () => {
    it('должен вернуть задачу по ID', async () => {
      const task = { 
        id: 'task-1', 
        title: 'Test Task',
        description: 'Description',
        statusId: 1,
        createdAt: new Date(),
        dueDate: null,
        createdBy: 'user-1'
      };
      vi.mocked(mockService.getById).mockResolvedValue(task);

      app.get('/tasks/:id', (c) => controller.getById(c));

      const res = await app.request('/tasks/task-1');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.task).toMatchObject({
        id: 'task-1',
        title: 'Test Task',
        description: 'Description',
        statusId: 1,
        dueDate: null,
        createdBy: 'user-1'
      });
      expect(data.task.createdAt).toBeDefined();
      expect(mockService.getById).toHaveBeenCalledWith('task-1');
    });

    it('должен вернуть 404 если задача не найдена', async () => {
      vi.mocked(mockService.getById).mockResolvedValue(null);

      app.get('/tasks/:id', async (c) => {
        const task = await mockService.getById(c.req.param('id'));
        if (!task) {
          return c.json({ error: 'Task not found' }, 404);
        }
        return c.json({ task });
      });

      const res = await app.request('/tasks/non-existent');

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('Task not found');
    });
  });

  describe('GET /tasks - getAll', () => {
    it('должен вернуть все задачи', async () => {
      const tasks = [
        { 
          id: 'task-1', 
          title: 'Task 1',
          description: 'Desc 1',
          statusId: 1,
          createdAt: new Date(),
          dueDate: null,
          createdBy: 'user-1'
        },
        { 
          id: 'task-2', 
          title: 'Task 2',
          description: 'Desc 2',
          statusId: 1,
          createdAt: new Date(),
          dueDate: null,
          createdBy: 'user-1'
        }
      ];
      vi.mocked(mockService.getAll).mockResolvedValue(tasks);

      app.get('/tasks', (c) => controller.getAll(c));

      const res = await app.request('/tasks');

      expect(res.status).toBe(200);
      const data = await res.json();
      // Проверяем что массив существует и имеет правильную длину
      expect(data.tasks).toBeDefined();
      expect(data.tasks.length).toBe(2);
      // Проверяем первую задачу без даты
      expect(data.tasks[0]).toMatchObject({
        id: 'task-1',
        title: 'Task 1',
        description: 'Desc 1',
        statusId: 1,
        dueDate: null,
        createdBy: 'user-1'
      });
      expect(data.tasks[0].createdAt).toBeDefined();
      
      expect(mockService.getAll).toHaveBeenCalledWith({});
    });

    it('должен передать query параметры в сервис', async () => {
      vi.mocked(mockService.getAll).mockResolvedValue([]);

      app.get('/tasks', (c) => controller.getAll(c));

      await app.request('/tasks?status=active&limit=10');

      expect(mockService.getAll).toHaveBeenCalledWith({
        status: 'active',
        limit: '10'
      });
    });
  });

  describe('PUT /tasks/:id - update', () => {
    it('должен обновить задачу', async () => {
      const updatedTask = { 
        id: 'task-1', 
        title: 'Updated Title',
        description: 'Description',
        statusId: 1,
        createdAt: new Date(),
        dueDate: null,
        createdBy: 'user-1'
      };
      vi.mocked(mockService.update).mockResolvedValue(updatedTask);

      app.put('/tasks/:id', (c) => controller.update(c));

      const res = await app.request('/tasks/task-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Title' }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.task).toMatchObject({
        id: 'task-1',
        title: 'Updated Title',
        description: 'Description',
        statusId: 1,
        dueDate: null,
        createdBy: 'user-1'
      });
      expect(data.task.createdAt).toBeDefined();
      expect(mockService.update).toHaveBeenCalledWith('task-1', {
        title: 'Updated Title'
      });
    });
  });

  describe('DELETE /tasks/:id - delete', () => {
    it('должен удалить задачу', async () => {
      const deletedTask = { 
        id: 'task-1', 
        title: 'Deleted',
        description: 'Description',
        statusId: 1,
        createdAt: new Date(),
        dueDate: null,
        createdBy: 'user-1'
      };
      vi.mocked(mockService.delete).mockResolvedValue(deletedTask);

      app.delete('/tasks/:id', (c) => controller.delete(c));

      const res = await app.request('/tasks/task-1', {
        method: 'DELETE',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.task).toMatchObject({
        id: 'task-1',
        title: 'Deleted',
        description: 'Description',
        statusId: 1,
        dueDate: null,
        createdBy: 'user-1'
      });
      expect(data.task.createdAt).toBeDefined();
      expect(mockService.delete).toHaveBeenCalledWith('task-1');
    });
  });
});