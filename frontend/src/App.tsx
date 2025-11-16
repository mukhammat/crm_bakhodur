import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import RegisterPage from './pages/RegisterPage';
import RequirePermission from './components/RequirePermission';
import { setupForegroundMessageHandler } from './lib/notifications';
import toast from 'react-hot-toast';

function App() {
  const { fetchUser, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Setup notification handler when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    let unsubscribe: (() => void) | null = null;

    setupForegroundMessageHandler((payload) => {
      // Show toast notification
      if (payload.notification) {
        toast.success(payload.notification.title || 'New notification', {
          description: payload.notification.body,
        });
      }
    }).then((unsub) => {
      unsubscribe = unsub;
    }).catch((error) => {
      console.error('Failed to setup notification handler:', error);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthenticated]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="tasks" element={
            <RequirePermission permission="VIEW_TASKS">
              <TasksPage />
            </RequirePermission>
          } />
          <Route path="users" element={
            <RequirePermission permission="VIEW_USERS">
              <UsersPage />
            </RequirePermission>
          } />
          <Route path="settings" element={
            <RequirePermission permission="MANAGE_PERMISSIONS">
              <SettingsPage />
            </RequirePermission>
          } />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

