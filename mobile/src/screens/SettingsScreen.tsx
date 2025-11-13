import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { apiClient } from '../lib/api';
import { UserRole, TaskStatus, Permission } from '../config/api';
import { useAuthStore } from '../stores/authStore';
import Card from '../components/Card';
import Button from '../components/Button';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TabType = 'roles' | 'statuses' | 'permissions' | 'assign';

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('roles');
  const [refreshing, setRefreshing] = useState(false);

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
      Alert.alert('Ошибка', 'Не удалось загрузить разрешения роли');
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
      Alert.alert('Ошибка', 'Не удалось загрузить данные');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Roles handlers
  const handleCreateRole = async () => {
    if (!newRoleTitle.trim()) return;
    try {
      await apiClient.createUserRole(newRoleTitle);
      setNewRoleTitle('');
      const rolesData = await apiClient.getUserRoles();
      setRoles(rolesData);
      Alert.alert('Успех', 'Роль создана');
    } catch (error: any) {
      Alert.alert('Ошибка', error.response?.data?.error || 'Ошибка создания роли');
    }
  };

  const handleUpdateRole = async (id: number) => {
    const role = roles.find((r) => r.id === id);
    if (!role) return;

    try {
      await apiClient.updateUserRole(id, role.title);
      setEditingRole(null);
      const rolesData = await apiClient.getUserRoles();
      setRoles(rolesData);
      Alert.alert('Успех', 'Роль обновлена');
    } catch (error: any) {
      Alert.alert('Ошибка', error.response?.data?.error || 'Ошибка обновления роли');
    }
  };

  const handleDeleteRole = async (id: number) => {
    Alert.alert('Удаление', 'Удалить роль?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.deleteUserRole(id);
            const rolesData = await apiClient.getUserRoles();
            setRoles(rolesData);
            Alert.alert('Успех', 'Роль удалена');
          } catch (error: any) {
            Alert.alert('Ошибка', error.response?.data?.error || 'Ошибка удаления роли');
          }
        },
      },
    ]);
  };

  // Statuses handlers
  const handleCreateStatus = async () => {
    if (!newStatusTitle.trim()) return;
    try {
      await apiClient.createTaskStatus(newStatusTitle);
      setNewStatusTitle('');
      const statusesData = await apiClient.getTaskStatuses();
      setStatuses(statusesData);
      Alert.alert('Успех', 'Статус создан');
    } catch (error: any) {
      Alert.alert('Ошибка', error.response?.data?.error || 'Ошибка создания статуса');
    }
  };

  const handleUpdateStatus = async (id: number) => {
    const status = statuses.find((s) => s.id === id);
    if (!status) return;

    try {
      await apiClient.updateTaskStatus(id, status.title);
      setEditingStatus(null);
      const statusesData = await apiClient.getTaskStatuses();
      setStatuses(statusesData);
      Alert.alert('Успех', 'Статус обновлен');
    } catch (error: any) {
      Alert.alert('Ошибка', error.response?.data?.error || 'Ошибка обновления статуса');
    }
  };

  const handleDeleteStatus = async (id: number) => {
    Alert.alert('Удаление', 'Удалить статус?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.deleteTaskStatus(id);
            const statusesData = await apiClient.getTaskStatuses();
            setStatuses(statusesData);
            Alert.alert('Успех', 'Статус удален');
          } catch (error: any) {
            Alert.alert('Ошибка', error.response?.data?.error || 'Ошибка удаления статуса');
          }
        },
      },
    ]);
  };

  // Permissions handlers
  const handleCreatePermission = async () => {
    if (!newPermissionTitle.trim()) return;
    try {
      const permission = await apiClient.createPermission(newPermissionTitle);
      setPermissions([...permissions, permission]);
      setNewPermissionTitle('');
      Alert.alert('Успех', 'Разрешение создано');
    } catch (error: any) {
      Alert.alert('Ошибка', error.response?.data?.error || 'Ошибка создания разрешения');
    }
  };

  const handleUpdatePermission = async (id: string) => {
    const permission = permissions.find((p) => p.id === id);
    if (!permission) return;

    try {
      await apiClient.updatePermission(id, permission.title);
      setEditingPermission(null);
      Alert.alert('Успех', 'Разрешение обновлено');
    } catch (error: any) {
      Alert.alert('Ошибка', error.response?.data?.error || 'Ошибка обновления разрешения');
    }
  };

  const handleDeletePermission = async (id: string) => {
    Alert.alert('Удаление', 'Удалить разрешение?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.deletePermission(id);
            setPermissions(permissions.filter((p) => p.id !== id));
            Alert.alert('Успех', 'Разрешение удалено');
          } catch (error: any) {
            Alert.alert('Ошибка', error.response?.data?.error || 'Ошибка удаления разрешения');
          }
        },
      },
    ]);
  };

  // Permission assignment handlers
  const handleAssignPermissionToRole = async (roleId: number, permissionId: string) => {
    try {
      await apiClient.assignPermissionToRole(roleId, permissionId);
      Alert.alert('Успех', 'Разрешение добавлено к роли');
      loadRolePermissions();
    } catch (error: any) {
      Alert.alert('Ошибка', error.response?.data?.error || 'Ошибка назначения разрешения');
    }
  };

  const handleRemovePermissionFromRole = async (roleId: number, permissionId: string) => {
    Alert.alert('Удаление', 'Удалить разрешение из роли?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.removePermissionFromRole(roleId, permissionId);
            Alert.alert('Успех', 'Разрешение удалено из роли');
            loadRolePermissions();
          } catch (error: any) {
            Alert.alert('Ошибка', error.response?.data?.error || 'Ошибка удаления разрешения');
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  const handleLogout = async () => {
    Alert.alert('Выход', 'Вы уверены, что хотите выйти?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Выйти',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Настройки системы</Text>
          <Text style={styles.subtitle}>Управление ролями, статусами и разрешениями</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'roles' && styles.tabActive]}
          onPress={() => setActiveTab('roles')}
        >
          <Text style={[styles.tabText, activeTab === 'roles' && styles.tabTextActive]}>Роли</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'statuses' && styles.tabActive]}
          onPress={() => setActiveTab('statuses')}
        >
          <Text style={[styles.tabText, activeTab === 'statuses' && styles.tabTextActive]}>Статусы</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'permissions' && styles.tabActive]}
          onPress={() => setActiveTab('permissions')}
        >
          <Text style={[styles.tabText, activeTab === 'permissions' && styles.tabTextActive]}>
            Разрешения
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'assign' && styles.tabActive]}
          onPress={() => setActiveTab('assign')}
        >
          <Text style={[styles.tabText, activeTab === 'assign' && styles.tabTextActive]}>Назначение</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'roles' && (
          <Card>
            <View style={styles.createSection}>
              <TextInput
                style={styles.input}
                value={newRoleTitle}
                onChangeText={setNewRoleTitle}
                placeholder="Название новой роли"
                onSubmitEditing={handleCreateRole}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleCreateRole}>
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            {roles.map((role) => (
              <View key={role.id} style={styles.item}>
                {editingRole === role.id ? (
                  <View style={styles.editSection}>
                    <TextInput
                      style={styles.input}
                      value={role.title}
                      onChangeText={(text) =>
                        setRoles(roles.map((r) => (r.id === role.id ? { ...r, title: text } : r)))
                      }
                    />
                    <TouchableOpacity onPress={() => handleUpdateRole(role.id)}>
                      <Ionicons name="checkmark" size={24} color="#10B981" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setEditingRole(null)}>
                      <Ionicons name="close" size={24} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text style={styles.itemText}>{role.title}</Text>
                    <View style={styles.itemActions}>
                      <TouchableOpacity onPress={() => setEditingRole(role.id)}>
                        <Ionicons name="create-outline" size={20} color="#3B82F6" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteRole(role.id)}>
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ))}
          </Card>
        )}

        {activeTab === 'statuses' && (
          <Card>
            <View style={styles.createSection}>
              <TextInput
                style={styles.input}
                value={newStatusTitle}
                onChangeText={setNewStatusTitle}
                placeholder="Название нового статуса"
                onSubmitEditing={handleCreateStatus}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleCreateStatus}>
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            {statuses.map((status) => (
              <View key={status.id} style={styles.item}>
                {editingStatus === status.id ? (
                  <View style={styles.editSection}>
                    <TextInput
                      style={styles.input}
                      value={status.title}
                      onChangeText={(text) =>
                        setStatuses(statuses.map((s) => (s.id === status.id ? { ...s, title: text } : s)))
                      }
                    />
                    <TouchableOpacity onPress={() => handleUpdateStatus(status.id)}>
                      <Ionicons name="checkmark" size={24} color="#10B981" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setEditingStatus(null)}>
                      <Ionicons name="close" size={24} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text style={styles.itemText}>{status.title}</Text>
                    <View style={styles.itemActions}>
                      <TouchableOpacity onPress={() => setEditingStatus(status.id)}>
                        <Ionicons name="create-outline" size={20} color="#3B82F6" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteStatus(status.id)}>
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ))}
          </Card>
        )}

        {activeTab === 'permissions' && (
          <Card>
            <View style={styles.createSection}>
              <TextInput
                style={styles.input}
                value={newPermissionTitle}
                onChangeText={setNewPermissionTitle}
                placeholder="Название нового разрешения"
                onSubmitEditing={handleCreatePermission}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleCreatePermission}>
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            {permissions.map((permission) => (
              <View key={permission.id} style={styles.item}>
                {editingPermission === permission.id ? (
                  <View style={styles.editSection}>
                    <TextInput
                      style={styles.input}
                      value={permission.title}
                      onChangeText={(text) =>
                        setPermissions(
                          permissions.map((p) => (p.id === permission.id ? { ...p, title: text } : p))
                        )
                      }
                    />
                    <TouchableOpacity onPress={() => handleUpdatePermission(permission.id)}>
                      <Ionicons name="checkmark" size={24} color="#10B981" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setEditingPermission(null)}>
                      <Ionicons name="close" size={24} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text style={styles.itemText}>{permission.title}</Text>
                    <View style={styles.itemActions}>
                      <TouchableOpacity onPress={() => setEditingPermission(permission.id)}>
                        <Ionicons name="create-outline" size={20} color="#3B82F6" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeletePermission(permission.id)}>
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ))}
          </Card>
        )}

        {activeTab === 'assign' && (
          <Card>
            <Text style={styles.sectionTitle}>Выберите роль</Text>
            <View style={styles.roleSelector}>
              {roles.map((role) => (
                <TouchableOpacity
                  key={role.id}
                  style={[
                    styles.roleButton,
                    selectedRole === role.id && styles.roleButtonActive,
                  ]}
                  onPress={() => setSelectedRole(role.id)}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      selectedRole === role.id && styles.roleButtonTextActive,
                    ]}
                  >
                    {role.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedRole && (
              <>
                <Text style={styles.sectionTitle}>
                  Разрешения для роли: {roles.find((r) => r.id === selectedRole)?.title}
                </Text>

                <Text style={styles.subsectionTitle}>Доступные разрешения</Text>
                {permissions
                  .filter((p) => {
                    const perm = rolePermissions.find((rp: any) => {
                      const permObj = rp.permission || rp;
                      return permObj.id === p.id;
                    });
                    return !perm;
                  })
                  .map((permission) => (
                    <View key={permission.id} style={styles.permissionItem}>
                      <Text style={styles.permissionText}>{permission.title}</Text>
                      <TouchableOpacity
                        onPress={() => handleAssignPermissionToRole(selectedRole, permission.id)}
                      >
                        <Ionicons name="add-circle" size={24} color="#10B981" />
                      </TouchableOpacity>
                    </View>
                  ))}

                <Text style={styles.subsectionTitle}>Назначенные разрешения</Text>
                {rolePermissions.length > 0 ? (
                  rolePermissions.map((rolePerm: any) => {
                    const perm = rolePerm.permission || rolePerm;
                    return (
                      <View key={rolePerm.id || perm.id} style={styles.permissionItemAssigned}>
                        <Text style={styles.permissionText}>{perm.title}</Text>
                        <TouchableOpacity
                          onPress={() => handleRemovePermissionFromRole(selectedRole, perm.id)}
                        >
                          <Ionicons name="remove-circle" size={24} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    );
                  })
                ) : (
                  <Text style={styles.emptyText}>Нет назначенных разрешений</Text>
                )}
              </>
            )}
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logoutButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  createSection: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  roleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  roleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
  },
  roleButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  roleButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  roleButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  permissionItemAssigned: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#D1FAE5',
  },
  permissionText: {
    fontSize: 14,
    color: '#111827',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 16,
  },
});

