import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';
import { Task, User } from '../config/api';
import toast from 'react-hot-toast';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksData, usersData] = await Promise.all([
        apiClient.getTasks(),
        apiClient.getUsers(),
      ]);
      setTasks(tasksData);
      setUsers(usersData);
    } catch (error) {
      toast.error('Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
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
                  onEdit={() => {
                    setEditingTask(task);
                    setIsModalOpen(true);
                  }}
                  onDelete={() => handleDelete(task.id)}
                />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
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

function TaskRow({ task, onEdit, onDelete }: { task: Task; onEdit: () => void; onDelete: () => void }) {
  const getStatusBadge = (statusId: number) => {
    const statuses: Record<number, { label: string; color: string }> = {
      1: { label: 'Ожидание', color: 'bg-yellow-100 text-yellow-800' },
      2: { label: 'В работе', color: 'bg-blue-100 text-blue-800' },
      3: { label: 'Выполнено', color: 'bg-green-100 text-green-800' },
    };
    const status = statuses[statusId] || statuses[1];
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  return (
    <tr>
      <td className="font-medium">{task.title}</td>
      <td className="max-w-xs truncate">{task.description}</td>
      <td>{getStatusBadge(task.statusId)}</td>
      <td>
        {task.dueDate ? formatDate(task.dueDate) : '-'}
      </td>
      <td>{formatDate(task.createdAt)}</td>
      <td>
        <div className="flex items-center space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function TaskModal({
  task,
  users,
  onClose,
  onSuccess,
}: {
  task: Task | null;
  users: User[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    statusId: task?.statusId || 1,
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    assigneeId: '', // Новое поле для исполнителя
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (task) {
        // Обновление существующей задачи
        const { assigneeId, ...updateData } = formData;
        await apiClient.updateTask(task.id, updateData);
        toast.success('Задача обновлена');
      } else {
        // Создание новой задачи
        await apiClient.createTask({
          title: formData.title,
          description: formData.description,
          statusId: formData.statusId,
          dueDate: formData.dueDate || undefined,
          assigneeId: formData.assigneeId || undefined,
        });
        toast.success('Задача создана');
      }

      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка сохранения');
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Исполнитель (опционально)</label>
              <select
                value={formData.assigneeId}
                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                className="input"
              >
                <option value="">Не назначено</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
                <select
                  value={formData.statusId}
                  onChange={(e) => setFormData({ ...formData, statusId: Number(e.target.value) })}
                  className="input"
                >
                  <option value={1}>Ожидание</option>
                  <option value={2}>В работе</option>
                  <option value={3}>Выполнено</option>
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

