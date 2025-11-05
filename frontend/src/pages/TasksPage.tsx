import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { Task, User } from '../config/api';
import toast from 'react-hot-toast';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { permissions } = useAuthStore();
  const location = useLocation();

  const canCreate = permissions.includes('CREATE_TASKS');
  const canUpdate = permissions.includes('UPDATE_TASKS');
  const canDelete = permissions.includes('DELETE_TASKS');

  const fetchStatuses = useCallback(async () => {
    try {
      const statusesData = await apiClient.getTaskStatuses();
      setStatuses(statusesData);
    } catch (error) {
      // Ошибка обрабатывается автоматически
    }
  }, []);

  const fetchData = async () => {
    try {
      const [tasksData, usersData, statusesData] = await Promise.all([
        apiClient.getTasks(),
        apiClient.getUsers(),
        apiClient.getTaskStatuses(),
      ]);
      setTasks(tasksData);
      setUsers(usersData);
      setStatuses(statusesData);
    } catch (error) {
      toast.error('Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleStatusesUpdated = () => {
      fetchStatuses();
    };
    window.addEventListener('statusesUpdated', handleStatusesUpdated);
    
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && location.pathname === '/tasks') {
        fetchStatuses();
      }
    }, 3000);

    return () => {
      window.removeEventListener('statusesUpdated', handleStatusesUpdated);
      clearInterval(interval);
    };
  }, [fetchStatuses, location.pathname]);

  const handleDelete = async (id: string) => {
    if (!canDelete) return;
    if (!confirm('Вы уверены, что хотите удалить задачу?')) return;

    try {
      await apiClient.deleteTask(id);
      toast.success('Задача удалена');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка удаления');
    }
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Задачи</h1>
          <p className="text-gray-600 mt-2">Управление задачами</p>
        </div>
        {canCreate && (
          <button
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Новая задача</span>
          </button>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Поиск задач..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Описание</th>
              <th>Статус</th>
              <th>Исполнитель</th>
              <th>Срок</th>
              <th>Создано</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  statuses={statuses}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                  onEdit={() => {
                    if (!canUpdate) return;
                    setEditingTask(task);
                    setIsModalOpen(true);
                  }}
                  onDelete={() => handleDelete(task.id)}
                />
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  Нет задач
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <TaskModal
          task={editingTask}
          users={users}
          statuses={statuses}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
          onSuccess={() => {
            fetchData();
            setIsModalOpen(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}

function TaskRow({ task, statuses, canUpdate, canDelete, onEdit, onDelete }: { task: Task; statuses: any[]; canUpdate: boolean; canDelete: boolean; onEdit: () => void; onDelete: () => void }) {
  const getStatusBadge = (statusId: number) => {
    const status = statuses.find(s => s.id === statusId);
    if (!status) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Неизвестно</span>;
    }
    let color = 'bg-gray-100 text-gray-800';
    if (status.title.includes('NEW') || status.title.includes('NEW')) {
      color = 'bg-yellow-100 text-yellow-800';
    } else if (status.title.includes('IN_PROGRESS') || status.title.includes('В работе')) {
      color = 'bg-blue-100 text-blue-800';
    } else if (status.title.includes('COMPLETED') || status.title.includes('Выполнено')) {
      color = 'bg-green-100 text-green-800';
    }
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{status.title}</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getAssignees = () => {
    if (!task.assignments || task.assignments.length === 0) {
      return <span className="text-gray-400">Не назначено</span>;
    }
    return (
      <div className="flex flex-col gap-1">
        {task.assignments.map((assignment) => (
          <span key={assignment.id} className="text-sm">
            {assignment.user?.name || assignment.userId}
          </span>
        ))}
      </div>
    );
  };

  return (
    <tr>
      <td className="font-medium">{task.title}</td>
      <td className="max-w-xs truncate">{task.description}</td>
      <td>{getStatusBadge(task.statusId)}</td>
      <td>{getAssignees()}</td>
      <td>
        {task.dueDate ? formatDate(task.dueDate) : '-'}
      </td>
      <td>{formatDate(task.createdAt)}</td>
      <td>
        <div className="flex items-center space-x-2">
          {canUpdate && (
            <button
              onClick={onEdit}
              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Edit size={18} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function TaskModal({
  task,
  users,
  statuses,
  onClose,
  onSuccess,
}: {
  task: Task | null;
  users: User[];
  statuses: any[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [fullTask, setFullTask] = useState<Task | null>(task);
  const [isLoadingTask, setIsLoadingTask] = useState(false);
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    statusId: task?.statusId || statuses[0]?.id || 1,
    dueDate: task?.dueDate ? (task.dueDate.includes('T') ? task.dueDate.split('T')[0] : task.dueDate) : '',
    assigneeIds: task?.assignments ? task.assignments.map(a => a.userId) : [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Загружаем полную информацию о задаче с assignments при редактировании
  useEffect(() => {
    if (task?.id) {
      // Если у нас уже есть task с assignments, используем их, иначе загружаем
      if (task.assignments !== undefined) {
        setFullTask(task);
        setFormData(prev => ({
          ...prev,
          assigneeIds: task.assignments ? task.assignments.map(a => a.userId) : []
        }));
      } else {
        setIsLoadingTask(true);
        apiClient.getTaskById(task.id)
          .then((loadedTask) => {
            setFullTask(loadedTask);
            // Обновляем assigneeIds из загруженных assignments
            setFormData(prev => ({
              ...prev,
              assigneeIds: loadedTask.assignments ? loadedTask.assignments.map(a => a.userId) : []
            }));
          })
          .catch((error) => {
            console.error('Failed to load task details:', error);
            toast.error('Не удалось загрузить полную информацию о задаче');
          })
          .finally(() => {
            setIsLoadingTask(false);
          });
      }
    }
  }, [task?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (task) {
        // Обновление существующей задачи
        const { assigneeIds, dueDate, ...updateData } = formData;
        const finalUpdateData: any = { ...updateData };
        // Обрабатываем dueDate: если пустая строка, отправляем null, иначе отправляем как есть (контроллер преобразует)
        if (dueDate === '') {
          finalUpdateData.dueDate = null;
        } else if (dueDate) {
          finalUpdateData.dueDate = dueDate;
        }
        await apiClient.updateTask(task.id, finalUpdateData);
        
        // Обработка назначения исполнителей (синхронизация с текущими назначениями)
        const currentAssigneeIds = fullTask?.assignments 
          ? fullTask.assignments.map(a => a.userId)
          : [];
        
        // Находим новых исполнителей (те, кто есть в formData, но нет в текущих)
        const newAssigneeIds = assigneeIds.filter(id => !currentAssigneeIds.includes(id));
        
        // Находим исполнителей для удаления (те, кто есть в текущих, но нет в formData)
        const removedAssigneeIds = currentAssigneeIds.filter(id => !assigneeIds.includes(id));
        
        // Удаляем старые назначения
        if (fullTask?.assignments) {
          for (const assignment of fullTask.assignments) {
            if (removedAssigneeIds.includes(assignment.userId)) {
              try {
                await apiClient.unassignTask(assignment.id);
              } catch (error) {
                console.error('Failed to unassign task:', error);
              }
            }
          }
        }
        
        // Добавляем новые назначения
        for (const userId of newAssigneeIds) {
          try {
            await apiClient.assignTask({
              taskId: task.id,
              userId: userId
            });
          } catch (error) {
            console.error('Failed to assign task:', error);
            toast.error(`Не удалось назначить исполнителя`);
          }
        }
        
        // Перезагружаем задачу, чтобы получить актуальные данные с assignments
        try {
          const updatedTask = await apiClient.getTaskById(task.id);
          setFullTask(updatedTask);
        } catch (error) {
          console.error('Failed to reload task:', error);
        }
        
        toast.success('Задача обновлена');
      } else {
        // Создание новой задачи
        const createdTask = await apiClient.createTask({
          title: formData.title,
          description: formData.description,
          statusId: formData.statusId,
          dueDate: formData.dueDate || undefined,
          assigneeId: formData.assigneeIds.length > 0 ? formData.assigneeIds[0] : undefined,
        });
        
        // Назначаем всех остальных исполнителей, если их несколько
        for (let i = 1; i < formData.assigneeIds.length; i++) {
          try {
            await apiClient.assignTask({
              taskId: createdTask.id,
              userId: formData.assigneeIds[i]
            });
          } catch (error) {
            console.error('Failed to assign task:', error);
            const userName = users.find(u => u.id === formData.assigneeIds[i])?.name;
            toast.error(`Не удалось назначить исполнителя${userName ? `: ${userName}` : ''}`);
          }
        }
        
        toast.success('Задача создана');
      }

      onSuccess();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Ошибка сохранения';
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Ошибка сохранения');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {task ? 'Редактировать задачу' : 'Новая задача'}
          </h2>
          
          {isLoadingTask && (
            <div className="mb-4 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600"></div>
              <p className="text-sm text-gray-600 mt-2">Загрузка данных задачи...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Название</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Исполнители (опционально)</label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-white">
                {users.length === 0 ? (
                  <p className="text-sm text-gray-500">Нет доступных пользователей</p>
                ) : (
                  users.map((user) => (
                    <label key={user.id} className="flex items-center space-x-2 py-2 cursor-pointer hover:bg-gray-50 rounded px-2">
                      <input
                        type="checkbox"
                        checked={formData.assigneeIds.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              assigneeIds: [...formData.assigneeIds, user.id]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              assigneeIds: formData.assigneeIds.filter(id => id !== user.id)
                            });
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{user.name}</span>
                    </label>
                  ))
                )}
              </div>
              {formData.assigneeIds.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">Не назначено</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
                <select
                  value={formData.statusId}
                  onChange={(e) => setFormData({ ...formData, statusId: Number(e.target.value) })}
                  className="input"
                >
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Срок выполнения</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                Отмена
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

