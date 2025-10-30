import { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

export default function RequirePermission({ permission, children }: { permission: string; children: ReactNode }) {
  const { permissions } = useAuthStore();
  const allowed = !permission || permissions.includes(permission);

  useEffect(() => {
    if (!allowed) {
      toast.error('Нет доступа');
    }
  }, [allowed]);

  if (!allowed) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
