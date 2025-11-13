import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { apiClient } from '../lib/api';
import { Task, User, TaskStatus } from '../config/api';
import { useAuthStore } from '../stores/authStore';
import Card from '../components/Card';
import Button from '../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { permissions } = useAuthStore();

  const canCreate = permissions.includes('CREATE_TASKS');
  const canUpdate = permissions.includes('UPDATE_TASKS');
  const canDelete = permissions.includes('DELETE_TASKS');

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchStatuses();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatuses = useCallback(async () => {
    try {
      const statusesData = await apiClient.getTaskStatuses();
      setStatuses(statusesData);
    } catch (error) {
      console.error('Error fetching statuses:', error);
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
      Alert.alert('Ошибка', 'Не удалось загрузить данные');
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
    if (!canDelete) return;
    Alert.alert('Удаление', 'Вы уверены, что хотите удалить задачу?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.deleteTask(id);
            Alert.alert('Успех', 'Задача удалена');
            fetchData();
          } catch (error: any) {
            Alert.alert('Ошибка', error.response?.data?.error || 'Ошибка удаления');
          }
        },
      },
    ]);
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Text style={styles.title}>Задачи</Text>
          <Text style={styles.subtitle}>Управление задачами</Text>
        </View>
        {canCreate && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск задач..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard
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
          <Card>
            <Text style={styles.emptyText}>Нет задач</Text>
          </Card>
        )}
      </ScrollView>

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
    </View>
  );
}

function TaskCard({
  task,
  statuses,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: {
  task: Task;
  statuses: TaskStatus[];
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const getStatusBadge = (statusId: number) => {
    const status = statuses.find((s) => s.id === statusId);
    if (!status) {
      return { title: 'Неизвестно', color: '#9CA3AF' };
    }
    if (status.title.includes('NEW') || status.title.includes('НОВАЯ')) {
      return { title: status.title, color: '#F59E0B' };
    } else if (status.title.includes('IN_PROGRESS') || status.title.includes('В работе')) {
      return { title: status.title, color: '#3B82F6' };
    } else if (status.title.includes('COMPLETED') || status.title.includes('Выполнено')) {
      return { title: status.title, color: '#10B981' };
    }
    return { title: status.title, color: '#6B7280' };
  };

  const status = getStatusBadge(task.statusId);
  const assignees = task.assignments?.map((a) => a.user?.name || a.userId).join(', ') || 'Не назначено';

  return (
    <Card>
      <View style={styles.taskCardHeader}>
        <Text style={styles.taskCardTitle}>{task.title}</Text>
        <View style={styles.taskCardActions}>
          {canUpdate && (
            <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
              <Ionicons name="create-outline" size={20} color="#3B82F6" />
            </TouchableOpacity>
          )}
          {canDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Text style={styles.taskCardDescription} numberOfLines={2}>
        {task.description}
      </Text>
      <View style={styles.taskCardMeta}>
        <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.title}</Text>
        </View>
        <Text style={styles.taskCardDate}>
          {format(new Date(task.createdAt), 'd MMM yyyy', { locale: ru })}
        </Text>
      </View>
      <Text style={styles.taskCardAssignee}>Исполнитель: {assignees}</Text>
    </Card>
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
  statuses: TaskStatus[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    statusId: task?.statusId || statuses[0]?.id || 1,
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    assigneeIds: task?.assignments ? task.assignments.map((a) => a.userId) : [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      Alert.alert('Ошибка', 'Заполните все обязательные поля');
      return;
    }

    setIsSubmitting(true);
    try {
      if (task) {
        const { assigneeIds, dueDate, ...updateData } = formData;
        const finalUpdateData: any = { ...updateData };
        if (dueDate === '') {
          finalUpdateData.dueDate = null;
        } else if (dueDate) {
          finalUpdateData.dueDate = dueDate;
        }
        await apiClient.updateTask(task.id, finalUpdateData);

        const currentAssigneeIds = task.assignments ? task.assignments.map((a) => a.userId) : [];
        const newAssigneeIds = assigneeIds.filter((id) => !currentAssigneeIds.includes(id));
        const removedAssigneeIds = currentAssigneeIds.filter((id) => !assigneeIds.includes(id));

        if (task.assignments) {
          for (const assignment of task.assignments) {
            if (removedAssigneeIds.includes(assignment.userId)) {
              try {
                await apiClient.unassignTask(assignment.id);
              } catch (error) {
                console.error('Failed to unassign task:', error);
              }
            }
          }
        }

        for (const userId of newAssigneeIds) {
          try {
            await apiClient.assignTask({
              taskId: task.id,
              userId: userId,
            });
          } catch (error) {
            console.error('Failed to assign task:', error);
          }
        }

        Alert.alert('Успех', 'Задача обновлена');
      } else {
        const createdTask = await apiClient.createTask({
          title: formData.title,
          description: formData.description,
          statusId: formData.statusId,
          dueDate: formData.dueDate || undefined,
          assigneeId: formData.assigneeIds.length > 0 ? formData.assigneeIds[0] : undefined,
        });

        for (let i = 1; i < formData.assigneeIds.length; i++) {
          try {
            await apiClient.assignTask({
              taskId: createdTask.id,
              userId: formData.assigneeIds[i],
            });
          } catch (error) {
            console.error('Failed to assign task:', error);
          }
        }

        Alert.alert('Успех', 'Задача создана');
      }
      onSuccess();
    } catch (error: any) {
      Alert.alert('Ошибка', error.response?.data?.error || 'Ошибка сохранения');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={true} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{task ? 'Редактировать задачу' : 'Новая задача'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <TextInput
              style={styles.modalInput}
              placeholder="Название"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Описание"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalSelectContainer}>
              <Text style={styles.modalLabel}>Статус</Text>
              <View style={styles.modalSelect}>
                {statuses.map((status) => (
                  <TouchableOpacity
                    key={status.id}
                    style={[
                      styles.modalSelectOption,
                      formData.statusId === status.id && styles.modalSelectOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, statusId: status.id })}
                  >
                    <Text
                      style={[
                        styles.modalSelectOptionText,
                        formData.statusId === status.id && styles.modalSelectOptionTextActive,
                      ]}
                    >
                      {status.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Срок выполнения (YYYY-MM-DD)"
              value={formData.dueDate}
              onChangeText={(text) => setFormData({ ...formData, dueDate: text })}
            />

            <View style={styles.modalSelectContainer}>
              <Text style={styles.modalLabel}>Исполнители</Text>
              {users.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={styles.modalCheckbox}
                  onPress={() => {
                    if (formData.assigneeIds.includes(user.id)) {
                      setFormData({
                        ...formData,
                        assigneeIds: formData.assigneeIds.filter((id) => id !== user.id),
                      });
                    } else {
                      setFormData({
                        ...formData,
                        assigneeIds: [...formData.assigneeIds, user.id],
                      });
                    }
                  }}
                >
                  <Ionicons
                    name={formData.assigneeIds.includes(user.id) ? 'checkbox' : 'checkbox-outline'}
                    size={24}
                    color={formData.assigneeIds.includes(user.id) ? '#3B82F6' : '#9CA3AF'}
                  />
                  <Text style={styles.modalCheckboxText}>{user.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button title="Отмена" onPress={onClose} variant="secondary" />
            <Button
              title={isSubmitting ? 'Сохранение...' : 'Сохранить'}
              onPress={handleSubmit}
              disabled={isSubmitting}
              loading={isSubmitting}
            />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  addButton: {
    backgroundColor: '#3B82F6',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  taskCardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  taskCardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  taskCardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  taskCardDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  taskCardAssignee: {
    fontSize: 12,
    color: '#6B7280',
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
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
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
  modalInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#111827',
  },
  modalTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalSelectContainer: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  modalSelect: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalSelectOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
  },
  modalSelectOptionActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  modalSelectOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalSelectOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  modalCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalCheckboxText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 8,
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

