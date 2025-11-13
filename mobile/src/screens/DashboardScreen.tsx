import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { apiClient } from '../lib/api';
import { Task, User } from '../config/api';
import Card from '../components/Card';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function DashboardScreen() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    totalUsers: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [tasks, users] = await Promise.all([
        apiClient.getTasks(),
        apiClient.getUsers(),
      ]);

      const completedTasks = tasks.filter((t) => t.statusId === 3).length;
      const pendingTasks = tasks.filter((t) => t.statusId === 1).length;

      setStats({
        totalTasks: tasks.length,
        totalUsers: users.length,
        completedTasks,
        pendingTasks,
      });

      setRecentTasks(tasks.slice(0, 5));
      setTopUsers(users.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Панель управления</Text>
        <Text style={styles.subtitle}>Обзор системы</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          icon="clipboard"
          label="Всего задач"
          value={stats.totalTasks}
          color="#3B82F6"
        />
        <StatCard
          icon="people"
          label="Пользователей"
          value={stats.totalUsers}
          color="#10B981"
        />
        <StatCard
          icon="checkmark-circle"
          label="Выполнено"
          value={stats.completedTasks}
          color="#059669"
        />
        <StatCard
          icon="time"
          label="В ожидании"
          value={stats.pendingTasks}
          color="#F59E0B"
        />
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Последние задачи</Text>
        {recentTasks.length > 0 ? (
          recentTasks.map((task) => (
            <View key={task.id} style={styles.taskItem}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskDescription} numberOfLines={2}>
                {task.description}
              </Text>
              <Text style={styles.taskDate}>
                {format(new Date(task.createdAt), 'd MMMM yyyy', { locale: ru })}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Нет задач</Text>
        )}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Активные пользователи</Text>
        {topUsers.length > 0 ? (
          topUsers.map((user) => (
            <View key={user.id} style={styles.userItem}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
              <View style={styles.activeBadge}>
                <Text style={styles.activeText}>Активен</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Нет пользователей</Text>
        )}
      </Card>
    </ScrollView>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <Card style={styles.statCard}>
      <View style={styles.statContent}>
        <View>
          <Text style={styles.statLabel}>{label}</Text>
          <Text style={styles.statValue}>{value}</Text>
        </View>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
      </View>
    </Card>
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
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  statCard: {
    width: '50%',
    margin: 4,
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  taskItem: {
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  taskDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  activeBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 16,
  },
});

