import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LogOut, LayoutDashboard, ClipboardList, Users, Settings } from 'lucide-react';
import { clsx } from 'clsx';

export default function Navbar() {
  const { user, permissions, logout } = useAuthStore();
  const location = useLocation();

  // Определяем разрешения для каждого раздела
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Панель', permission: null },
    { path: '/tasks', icon: ClipboardList, label: 'Задачи', permission: 'VIEW_TASKS' },
    { path: '/users', icon: Users, label: 'Пользователи', permission: 'VIEW_USERS' },
    { path: '/settings', icon: Settings, label: 'Настройки', permission: 'MANAGE_PERMISSIONS' },
  ];

  const allowedNavItems = navItems.filter(item => !item.permission || permissions.includes(item.permission));

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="text-xl font-bold text-primary-600">
              CRM Bakhodur
            </Link>

            <div className="flex space-x-1">
              {allowedNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={clsx(
                      'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>Выход</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

