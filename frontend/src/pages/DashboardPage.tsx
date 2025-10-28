import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';
import { Task, User } from '../config/api';
import { ClipboardList, Users, CheckCircle, Clock } from 'lucide-react';
export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    totalUsers: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
  };

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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Панель управления</h1>
        <p className="text-gray-600 mt-2">Обзор системы</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={ClipboardList}
          label="Всего задач"
          value={stats.totalTasks}
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Пользователей"
          value={stats.totalUsers}
          color="green"
        />
        <StatCard
          icon={CheckCircle}
          label="Выполнено"
          value={stats.completedTasks}
          color="emerald"
        />
        <StatCard
          icon={Clock}
          label="В ожидании"
          value={stats.pendingTasks}
          color="yellow"
        />
      </div>

      {/* Recent Tasks and Top Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Последние задачи</h2>
          <div className="space-y-3">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <div key={task.id} className="border-b border-gray-200 pb-3 last:border-0">
                  <h3 className="font-medium text-gray-900">{task.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(task.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Нет задач</p>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Активные пользователи</h2>
          <div className="space-y-3">
            {topUsers.length > 0 ? (
              topUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    Активен
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Нет пользователей</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

