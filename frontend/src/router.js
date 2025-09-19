import { createRouter, createWebHistory } from "vue-router";

import DashboardPage from './components/DashboardPage.vue'
import TaskManager from './components/tasks/TaskManager.vue';
import UserManager from "./components/users/UserManager.vue";
import LoginPage from './components/LoginPage.vue'
import { useAuthStore } from './stores/auth.js'

const routes = [
    {
      path: "/tasks",
      name: "tasks",
      component: TaskManager
    },
    {
      path: "/user",
      name: "users",
      component: UserManager
    },
    {
      path: "/",
      name: "dashboard",
      component: DashboardPage
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage
    }
]

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  const allowedRoles = to.meta.roles

  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    return next("/") // или например на страницу "403 Forbidden"
  }

  next()
})

export default router;