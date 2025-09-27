// composables/usePermissions.js
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth.js'

export function usePermissions() {
  const auth = useAuthStore()

  const userRole = computed(() => auth.role)
  
  const isAdmin = computed(() => userRole.value === 'admin')
  const isManager = computed(() => userRole.value === 'manager')
  const isWorker = computed(() => userRole.value === 'worker')
  
  const hasRole = (role) => userRole.value === role
  
  const hasAnyRole = (roles) => roles.includes(userRole.value)
  
  const canManageUsers = computed(() => hasAnyRole(['admin', 'manager']))
  const canCreateTasks = computed(() => hasAnyRole(['admin', 'manager']))
  const canViewAllTasks = computed(() => hasAnyRole(['admin', 'manager']))
  const canOnlyViewOwnTasks = computed(() => userRole.value === 'worker')

  return {
    userRole,
    isAdmin,
    isManager,
    isWorker,
    hasRole,
    hasAnyRole,
    canManageUsers,
    canCreateTasks,
    canViewAllTasks,
    canOnlyViewOwnTasks
  }
}