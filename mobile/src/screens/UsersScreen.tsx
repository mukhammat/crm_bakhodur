import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { apiClient } from '../lib/api';
import { User, UserRole } from '../config/api';
import { useAuthStore } from '../stores/authStore';
import Card from '../components/Card';
import Button from '../components/Button';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [generatedKey, setGeneratedKey] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const { permissions } = useAuthStore();

  const canDeleteUsers = permissions.includes('DELETE_USERS');
  const canGenerateKeys = permissions.includes('MANAGE_PERMISSIONS');

  const availableRoles = roles.filter(
    (role) => role.id !== 1 && !role.title.toUpperCase().includes('ADMIN')
  );

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchRoles();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchRoles = async () => {
    try {
      const rolesData = await apiClient.getUserRoles();
      setRoles(rolesData);
      const nonAdminRoles = rolesData.filter(
        (r) => r.id !== 1 && !r.title.toUpperCase().includes('ADMIN')
      );
      if (nonAdminRoles.length > 0 && !selectedRole) {
        setSelectedRole(nonAdminRoles[0].title);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [usersData, rolesData] = await Promise.all([
        apiClient.getUsers(),
        apiClient.getUserRoles(),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
      const nonAdminRoles = rolesData.filter(
        (r) => r.id !== 1 && !r.title.toUpperCase().includes('ADMIN')
      );
      if (nonAdminRoles.length > 0) {
        setSelectedRole(nonAdminRoles[0].title);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить пользователей');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!canDeleteUsers) return;
    Alert.alert('Удаление', 'Вы уверены, что хотите удалить пользователя?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.deleteUser(id);
            Alert.alert('Успех', 'Пользователь удален');
            fetchData();
          } catch (error: any) {
            Alert.alert('Ошибка', error.response?.data?.error || 'Ошибка удаления');
          }
        },
      },
    ]);
  };

  const handleGenerateKey = async () => {
    if (!canGenerateKeys || !selectedRole) return;
    try {
      const key = await apiClient.generateKey(selectedRole);
      setGeneratedKey(key);
      setIsKeyModalOpen(true);
    } catch (error: any) {
      Alert.alert('Ошибка', error.response?.data?.error || 'Ошибка генерации ключа');
    }
  };

  const getRoleName = (roleId: number) => {
    const role = roles.find((r) => r.id === roleId);
    return role?.title || 'Неизвестно';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Пользователи</Text>
          <Text style={styles.subtitle}>Управление пользователями</Text>
        </View>
        {canGenerateKeys && (
          <View style={styles.keySection}>
            <View style={styles.roleSelector}>
              {availableRoles.length > 0 ? (
                <>
                  {availableRoles.map((role) => (
                    <TouchableOpacity
                      key={role.id}
                      style={[
                        styles.roleButton,
                        selectedRole === role.title && styles.roleButtonActive,
                      ]}
                      onPress={() => setSelectedRole(role.title)}
                    >
                      <Text
                        style={[
                          styles.roleButtonText,
                          selectedRole === role.title && styles.roleButtonTextActive,
                        ]}
                      >
                        {role.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity style={styles.generateButton} onPress={handleGenerateKey}>
                    <Ionicons name="key" size={20} color="#fff" />
                    <Text style={styles.generateButtonText}>Ключ</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.noRolesText}>Нет доступных ролей</Text>
              )}
            </View>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {users.length > 0 ? (
          users.map((user) => (
            <Card key={user.id}>
              <View style={styles.userCard}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <View style={styles.userMeta}>
                    <Text style={styles.userRole}>{getRoleName(user.roleId)}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        user.isActive ? styles.statusBadgeActive : styles.statusBadgeInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          user.isActive ? styles.statusTextActive : styles.statusTextInactive,
                        ]}
                      >
                        {user.isActive ? 'Активен' : 'Неактивен'}
                      </Text>
                    </View>
                  </View>
                </View>
                {canDeleteUsers && (
                  <TouchableOpacity onPress={() => handleDelete(user.id)} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          ))
        ) : (
          <Card>
            <Text style={styles.emptyText}>Нет пользователей</Text>
          </Card>
        )}
      </ScrollView>

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
    </View>
  );
}

function KeyModal({
  keyValue,
  role,
  onClose,
}: {
  keyValue: string;
  role: string;
  onClose: () => void;
}) {
  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(keyValue);
    Alert.alert('Успех', 'Ключ скопирован в буфер обмена');
  };

  return (
    <Modal visible={true} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ключ регистрации ({role})</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <View style={styles.keyContainer}>
              <Text style={styles.keyText} selectable>
                {keyValue}
              </Text>
            </View>
          </View>
          <View style={styles.modalFooter}>
            <Button title="Копировать" onPress={copyToClipboard} variant="secondary" />
            <Button title="Закрыть" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
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
    padding: 16,
    paddingTop: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    marginBottom: 12,
  },
  keySection: {
    marginTop: 12,
  },
  roleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  roleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  noRolesText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  scrollView: {
    flex: 1,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userRole: {
    fontSize: 14,
    color: '#374151',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeActive: {
    backgroundColor: '#D1FAE5',
  },
  statusBadgeInactive: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#065F46',
  },
  statusTextInactive: {
    color: '#991B1B',
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalBody: {
    padding: 16,
  },
  keyContainer: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
  },
  keyText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#111827',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
});

