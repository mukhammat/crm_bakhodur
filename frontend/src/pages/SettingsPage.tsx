import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { UserRole, TaskStatus, Permission } from '../config/api';
import { Plus, Edit2, Trash2, Save, X, Key } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'roles' | 'statuses' | 'permissions' | 'assign'>('roles');
  
  // Roles state
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [editingRole, setEditingRole] = useState<number | null>(null);
  const [newRoleTitle, setNewRoleTitle] = useState('');
  
  // Task Statuses state
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [editingStatus, setEditingStatus] = useState<number | null>(null);
  const [newStatusTitle, setNewStatusTitle] = useState('');
  
  // Permissions state
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [editingPermission, setEditingPermission] = useState<string | null>(null);
  const [newPermissionTitle, setNewPermissionTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Assignment state
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      loadRolePermissions();
    }
  }, [selectedRole]);

  const loadRolePermissions = async () => {
    if (!selectedRole) return;
    try {
      const perms = await apiClient.getRolePermissions(selectedRole);
      setRolePermissions(perms);
    } catch (error) {
      toast.error('Ошибка загрузки разрешений роли');
    }
  };

  const loadData = async () => {
    try {
      const [rolesData, statusesData, permissionsData] = await Promise.all([
        apiClient.getUserRoles(),
        apiClient.getTaskStatuses(),
        apiClient.getPermissions(),
      ]);
      setRoles(rolesData);
      setStatuses(statusesData);
      setPermissions(permissionsData);
    } catch (error) {
      toast.error('Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  };

  // Roles handlers
  const handleCreateRole = async () => {
    if (!newRoleTitle.trim()) return;
    try {
      await apiClient.createUserRole(newRoleTitle);
      setNewRoleTitle('');
      // Перезагружаем все роли с сервера для синхронизации
      const rolesData = await apiClient.getUserRoles();
      setRoles(rolesData);
      toast.success('Роль создана');
      window.dispatchEvent(new CustomEvent('rolesUpdated'));
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка создания роли');
    }
  };

  const handleUpdateRole = async (id: number) => {
    const role = roles.find(r => r.id === id);
    if (!role) return;
    
    try {
      await apiClient.updateUserRole(id, role.title);
      setEditingRole(null);
      // Перезагружаем все роли с сервера для синхронизации
      const rolesData = await apiClient.getUserRoles();
      setRoles(rolesData);
      toast.success('Роль обновлена');
      window.dispatchEvent(new CustomEvent('rolesUpdated'));
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка обновления роли');
    }
  };

  const handleDeleteRole = async (id: number) => {
    if (!confirm('Удалить роль?')) return;
    try {
      await apiClient.deleteUserRole(id);
      // Перезагружаем все роли с сервера для синхронизации
      const rolesData = await apiClient.getUserRoles();
      setRoles(rolesData);
      toast.success('Роль удалена');
      window.dispatchEvent(new CustomEvent('rolesUpdated'));
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка удаления роли');
    }
  };

  // Statuses handlers
  const handleCreateStatus = async () => {
    if (!newStatusTitle.trim()) return;
    try {
      await apiClient.createTaskStatus(newStatusTitle);
      setNewStatusTitle('');
      const statusesData = await apiClient.getTaskStatuses();
      setStatuses(statusesData);
      toast.success('Статус создан');
      window.dispatchEvent(new CustomEvent('statusesUpdated'));
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка создания статуса');
    }
  };

  const handleUpdateStatus = async (id: number) => {
    const status = statuses.find(s => s.id === id);
    if (!status) return;
    
    try {
      await apiClient.updateTaskStatus(id, status.title);
      setEditingStatus(null);
      const statusesData = await apiClient.getTaskStatuses();
      setStatuses(statusesData);
      toast.success('Статус обновлен');
      window.dispatchEvent(new CustomEvent('statusesUpdated'));
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка обновления статуса');
    }
  };

  const handleDeleteStatus = async (id: number) => {
    if (!confirm('Удалить статус?')) return;
    try {
      await apiClient.deleteTaskStatus(id);
      const statusesData = await apiClient.getTaskStatuses();
      setStatuses(statusesData);
      toast.success('Статус удален');
      window.dispatchEvent(new CustomEvent('statusesUpdated'));
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка удаления статуса');
    }
  };

  // Permissions handlers
  const handleCreatePermission = async () => {
    if (!newPermissionTitle.trim()) return;
    try {
      const permission = await apiClient.createPermission(newPermissionTitle);
      setPermissions([...permissions, permission]);
      setNewPermissionTitle('');
      toast.success('Разрешение создано');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка создания разрешения');
    }
  };

  const handleUpdatePermission = async (id: string) => {
    const permission = permissions.find(p => p.id === id);
    if (!permission) return;
    
    try {
      await apiClient.updatePermission(id, permission.title);
      setEditingPermission(null);
      toast.success('Разрешение обновлено');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка обновления разрешения');
    }
  };

  const handleDeletePermission = async (id: string) => {
    if (!confirm('Удалить разрешение?')) return;
    try {
      await apiClient.deletePermission(id);
      setPermissions(permissions.filter(p => p.id !== id));
      toast.success('Разрешение удалено');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка удаления разрешения');
    }
  };

  // Permission assignment handlers
  const handleAssignPermissionToRole = async (roleId: number, permissionId: string) => {
    try {
      await apiClient.assignPermissionToRole(roleId, permissionId);
      toast.success('Разрешение добавлено к роли');
      loadRolePermissions();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка назначения разрешения');
    }
  };

  const handleRemovePermissionFromRole = async (roleId: number, permissionId: string) => {
    if (!confirm('Удалить разрешение из роли?')) return;
    try {
      await apiClient.removePermissionFromRole(roleId, permissionId);
      toast.success('Разрешение удалено из роли');
      loadRolePermissions();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка удаления разрешения');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Настройки системы</h1>
        <p className="text-gray-600 mt-2">Управление ролями, статусами и разрешениями</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'roles'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Роли пользователей
          </button>
          <button
            onClick={() => setActiveTab('statuses')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'statuses'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Статусы задач
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'permissions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Разрешения
          </button>
          <button
            onClick={() => setActiveTab('assign')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assign'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Назначение разрешений
          </button>
        </nav>
      </div>

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Роли пользователей</h2>
          </div>
          
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={newRoleTitle}
              onChange={(e) => setNewRoleTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateRole()}
              placeholder="Название новой роли"
              className="flex-1 input"
            />
            <button onClick={handleCreateRole} className="btn btn-primary">
              <Plus size={20} />
              Добавить
            </button>
          </div>

          <div className="space-y-2">
            {roles.map((role) => (
              <div key={role.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                {editingRole === role.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={role.title}
                      onChange={(e) => setRoles(roles.map(r => r.id === role.id ? { ...r, title: e.target.value } : r))}
                      className="flex-1 input"
                    />
                    <button onClick={() => handleUpdateRole(role.id)} className="btn-icon btn-icon-success">
                      <Save size={18} />
                    </button>
                    <button onClick={() => setEditingRole(null)} className="btn-icon btn-icon-danger">
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-gray-900 font-medium">{role.title}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingRole(role.id)} className="btn-icon">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDeleteRole(role.id)} className="btn-icon btn-icon-danger">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statuses Tab */}
      {activeTab === 'statuses' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Статусы задач</h2>
          </div>
          
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={newStatusTitle}
              onChange={(e) => setNewStatusTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateStatus()}
              placeholder="Название нового статуса"
              className="flex-1 input"
            />
            <button onClick={handleCreateStatus} className="btn btn-primary">
              <Plus size={20} />
              Добавить
            </button>
          </div>

          <div className="space-y-2">
            {statuses.map((status) => (
              <div key={status.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                {editingStatus === status.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={status.title}
                      onChange={(e) => setStatuses(statuses.map(s => s.id === status.id ? { ...s, title: e.target.value } : s))}
                      className="flex-1 input"
                    />
                    <button onClick={() => handleUpdateStatus(status.id)} className="btn-icon btn-icon-success">
                      <Save size={18} />
                    </button>
                    <button onClick={() => setEditingStatus(null)} className="btn-icon btn-icon-danger">
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-gray-900 font-medium">{status.title}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingStatus(status.id)} className="btn-icon">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDeleteStatus(status.id)} className="btn-icon btn-icon-danger">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Разрешения</h2>
          </div>
          
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={newPermissionTitle}
              onChange={(e) => setNewPermissionTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreatePermission()}
              placeholder="Название нового разрешения"
              className="flex-1 input"
            />
            <button onClick={handleCreatePermission} className="btn btn-primary">
              <Plus size={20} />
              Добавить
            </button>
          </div>

          <div className="space-y-2">
            {permissions.map((permission) => (
              <div key={permission.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                {editingPermission === permission.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={permission.title}
                      onChange={(e) => setPermissions(permissions.map(p => p.id === permission.id ? { ...p, title: e.target.value } : p))}
                      className="flex-1 input"
                    />
                    <button onClick={() => handleUpdatePermission(permission.id)} className="btn-icon btn-icon-success">
                      <Save size={18} />
                    </button>
                    <button onClick={() => setEditingPermission(null)} className="btn-icon btn-icon-danger">
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-gray-900 font-medium">{permission.title}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingPermission(permission.id)} className="btn-icon">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDeletePermission(permission.id)} className="btn-icon btn-icon-danger">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assignment Tab */}
      {activeTab === 'assign' && (
        <div className="card">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Назначение разрешений ролям</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Выберите роль</label>
              <select
                value={selectedRole || ''}
                onChange={(e) => setSelectedRole(Number(e.target.value))}
                className="input"
              >
                <option value="">Выберите роль...</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedRole && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Разрешения для роли: {roles.find(r => r.id === selectedRole)?.title}
                </h3>

                {/* Available Permissions */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Доступные разрешения</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {permissions
                      .filter(p => !rolePermissions.some((rp: any) => {
                        const perm = rp.permission || rp;
                        return perm.id === p.id;
                      }))
                      .map((permission) => (
                        <div key={permission.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <span className="text-gray-700">{permission.title}</span>
                          <button
                            onClick={() => handleAssignPermissionToRole(selectedRole, permission.id)}
                            className="btn-icon btn-icon-success"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      ))}
                    {permissions.filter(p => !rolePermissions.some((rp: any) => {
                      const perm = rp.permission || rp;
                      return perm.id === p.id;
                    })).length === 0 && (
                      <p className="text-gray-500 text-sm">Все разрешения назначены</p>
                    )}
                  </div>
                </div>

                {/* Assigned Permissions */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Назначенные разрешения</h4>
                  <div className="space-y-2">
                    {rolePermissions.length > 0 ? (
                      rolePermissions.map((rolePerm: any) => {
                        const perm = rolePerm.permission || rolePerm;
                        return (
                          <div key={rolePerm.id || perm.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                            <span className="text-gray-700">{perm.title}</span>
                            <button
                              onClick={() => handleRemovePermissionFromRole(selectedRole!, perm.id)}
                              className="btn-icon btn-icon-danger"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-500 text-sm">Нет назначенных разрешений</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

