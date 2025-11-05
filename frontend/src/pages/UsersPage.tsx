import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { User, UserRole } from '../config/api';
import toast from 'react-hot-toast';
import { Search, Trash2, Key } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [generatedKey, setGeneratedKey] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const { permissions } = useAuthStore();
  const location = useLocation();

  const canDeleteUsers = permissions.includes('DELETE_USERS');
  const canGenerateKeys = permissions.includes('MANAGE_PERMISSIONS');

  // Фильтруем роли: исключаем ADMIN (обычно id=1 или title содержит ADMIN)
  const availableRoles = roles.filter(role => 
    role.id !== 1 && !role.title.toUpperCase().includes('ADMIN')
  );

  const fetchRoles = useCallback(async () => {
    try {
      const rolesData = await apiClient.getUserRoles();
      // Всегда обновляем список ролей
      setRoles(rolesData);
      
      // Обновляем выбранную роль, если нужно
      const nonAdminRoles = rolesData.filter(r => r.id !== 1 && !r.title.toUpperCase().includes('ADMIN'));
      if (nonAdminRoles.length > 0) {
        setSelectedRole(prev => {
          // Если текущая роль существует в новом списке, оставляем её
          const currentRoleExists = nonAdminRoles.some(r => r.title === prev);
          if (currentRoleExists && prev) {
            return prev;
          }
          // Иначе выбираем первую доступную
          return nonAdminRoles[0].title;
        });
      } else {
        // Если нет доступных ролей, сбрасываем выбор
        setSelectedRole('');
      }
    } catch (error) {
      // Ошибка загрузки ролей обрабатывается автоматически
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles();

    // Обновляем роли при кастомном событии (когда роль создана/удалена/обновлена в настройках)
    const handleRolesUpdated = () => {
      fetchRoles();
    };
    window.addEventListener('rolesUpdated', handleRolesUpdated);
    
    // Периодическое обновление ролей (каждые 3 секунды), если страница видима
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && location.pathname === '/users') {
        fetchRoles();
      }
    }, 3000);

    return () => {
      window.removeEventListener('rolesUpdated', handleRolesUpdated);
      clearInterval(interval);
    };
  }, [fetchRoles, location.pathname]);


  const fetchUsers = async () => {
    try {
      const usersData = await apiClient.getUsers();
      setUsers(usersData);
    } catch (error) {
      toast.error('Ошибка загрузки пользователей');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDeleteUsers) return;
    if (!confirm('Вы уверены, что хотите удалить пользователя?')) return;

    try {
      await apiClient.deleteUser(id);
      toast.success('Пользователь удален');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка удаления');
    }
  };

  const handleGenerateKey = async () => {
    if (!canGenerateKeys || !selectedRole) return;
    try {
      const key = await apiClient.generateKey(selectedRole);
      setGeneratedKey(key);
      setIsKeyModalOpen(true);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка генерации ключа');
    }
  };

  const getRoleName = (roleId: number) => {
    const roles: Record<number, string> = {
      1: 'Администратор',
      2: 'Менеджер',
      3: 'Работник',
    };
    return roles[roleId] || 'Неизвестно';
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gray-900">Пользователи</h1>
          <p className="text-gray-600 mt-2">Управление пользователями</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="input w-auto"
            disabled={!canGenerateKeys || availableRoles.length === 0}
          >
            {availableRoles.length === 0 ? (
              <option value="">Нет доступных ролей</option>
            ) : (
              availableRoles.map((role) => (
                <option key={role.id} value={role.title}>
                  {role.title}
                </option>
              ))
            )}
          </select>
          {canGenerateKeys && selectedRole && (
            <button onClick={handleGenerateKey} className="btn btn-primary flex items-center space-x-2">
              <Key size={20} />
              <span>Сгенерировать ключ</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Поиск пользователей..."
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
              <th>Имя</th>
              <th>Email</th>
              <th>Роль</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="font-medium">{user.name}</td>
                  <td>{user.email}</td>
                  <td>{getRoleName(user.roleId)}</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.isActive ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      {canDeleteUsers && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  Нет пользователей
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isKeyModalOpen && generatedKey && (
        <KeyModal
          keyValue={generatedKey}
          role={selectedRole}
          onClose={() => {
            setIsKeyModalOpen(false);
            setGeneratedKey('');
          }}
        />
      )}
    </div>
  );
}

function KeyModal({ keyValue, role, onClose }: { keyValue: string; role: string; onClose: () => void }) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(keyValue);
    toast.success('Ключ скопирован в буфер обмена');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ключ регистрации ({role})
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-sm font-mono break-all">{keyValue}</p>
          </div>
          <div className="flex items-center justify-end space-x-3">
            <button onClick={copyToClipboard} className="btn btn-secondary">
              Копировать
            </button>
            <button onClick={onClose} className="btn btn-primary">
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

