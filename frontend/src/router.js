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
        roles: ['admin', 'manager', 'worker'] // все роли могут видеть задачи
      }
    },
    {
      path: "/users",
      name: "users",
      component: UserManager,
      meta: { 
        requiresAuth: true,
        roles: ['admin', 'manager'] // только админы и менеджеры
      }
    },
    {
      path: "/",
      name: "dashboard",
      component: DashboardPage,
      meta: { 
        requiresAuth: true,
        roles: ['admin', 'manager',] // все авторизованные пользователи
      }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta: { 
        hideHeader: true,
        requiresGuest: true // только для неавторизованных
      }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterPage,
      meta: { 
        hideHeader: true,
        requiresGuest: true // только для неавторизованных
      }
    },
    // Страница "Доступ запрещен"
    {
      path: '/forbidden',
      name: 'forbidden',
      component: () => import('./components/ForbiddenPage.vue'),
      meta: { hideHeader: true }
    },
    // Перенаправление неизвестных маршрутов
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
  const auth = useAuthStore()

  // Ждём инициализации если токен есть, но пользователь не загружен
  if (auth.token && !auth.user) {
    try {
      await auth.fetchMe()
    } catch (error) {
      console.warn('Failed to fetch user during navigation:', error.message)
    }
  }

  // Проверка авторизации
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next('/login')
  }

  // Проверка гостевых страниц (только для неавторизованных)
  if (to.meta.requiresGuest && auth.isAuthenticated) {
    return next('/')
  }

  // Проверка ролей
  if (to.meta.roles && auth.isAuthenticated) {
    const userRole = auth.role
    const allowedRoles = to.meta.roles

    if (!allowedRoles.includes(userRole)) {
      console.warn(`Access denied. User role: ${userRole}, Required roles: ${allowedRoles}`)
      return next('/forbidden')
    }
  }

  next()
})

export default router;