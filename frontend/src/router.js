import { createRouter, createWebHistory } from "vue-router";

import DashboardPage from './components/DashboardPage.vue'
import TaskManager from './components/tasks/TaskManager.vue';
import UserManager from "./components/users/UserManager.vue";
import LoginPage from './components/LoginPage.vue'
import RegisterPage from "./components/RegisterPage.vue";
import { useAuthStore } from './stores/auth.js'

const routes = [
    {
      path: "/tasks",
      name: "tasks",
      component: TaskManager,
      meta: { 
        requiresAuth: true,
        roles: ['ADMIN', 'MANAGER', 'WORKER']
      }
    },
    {
      path: "/users",
      name: "users",
      component: UserManager,
      meta: { 
        requiresAuth: true,
        roles: ['ADMIN', 'MANAGER']
      }
    },
    {
      path: "/",
      name: "dashboard",
      component: DashboardPage,
      meta: { 
        requiresAuth: true,
        roles: ['ADMIN', 'MANAGER']
      }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta: { 
        hideHeader: true,
        requiresGuest: true
      }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterPage,
      meta: { 
        hideHeader: true,
        requiresGuest: true
      }
    },
    {
      path: '/forbidden',
      name: 'forbidden',
      component: () => import('./components/ForbiddenPage.vue'),
      meta: { hideHeader: true }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
]

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  // Получаем store (он уже инициализирован в main.js)
  const auth = useAuthStore()

  // Если идём на гостевые страницы (login/register) - пропускаем проверки
  if (to.meta.requiresGuest) {
    // Если уже авторизован и есть пользователь - редирект на главную
    if (auth.token && auth.user) {
      return next('/')
    }
    return next()
  }

  // Если есть токен, но нет пользователя - пытаемся загрузить
  if (auth.token && !auth.user) {
    try {
      await auth.fetchMe()
    } catch (error) {
      console.warn('Failed to fetch user:', error.message)
      // auth.logout() уже вызван в fetchMe при ошибке
    }
  }

  // Проверяем реальную авторизацию
  const isAuthenticated = auth.token && auth.user

  // Если требуется авторизация, но её нет
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next('/login')
  }

  // Проверка ролей
  if (to.meta.roles && isAuthenticated) {
    const userRole = auth.role
    const allowedRoles = to.meta.roles

    if (!allowedRoles.includes(userRole)) {
      console.warn(`Access denied. User role: ${userRole}, Required: ${allowedRoles}`)
      return next('/forbidden')
    }
  }

  next()
})

export default router;