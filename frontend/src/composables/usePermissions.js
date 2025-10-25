// composables/usePermissions.js
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth.js'

export function usePermissions() {
  const auth = useAuthStore()

  const userRole = computed(() => auth.role)
  
  const isAdmin = computed(() => userRole.value === 'ADMIN')
  const isManager = computed(() => userRole.value === 'MANAGER')
  const isWorker = computed(() => userRole.value === 'WORKER')
  
  const hasRole = (role) => userRole.value === role.toUpperCase()
  
  const hasAnyRole = (roles) => roles.map(r => r.toUpperCase()).includes(userRole.value)
  
  const canManageUsers = computed(() => hasAnyRole(['ADMIN', 'MANAGER']))
  const canCreateTasks = computed(() => hasAnyRole(['ADMIN', 'MANAGER']))
  const canViewAllTasks = computed(() => hasAnyRole(['ADMIN', 'MANAGER']))
  const canOnlyViewOwnTasks = computed(() => userRole.value === 'WORKER')

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