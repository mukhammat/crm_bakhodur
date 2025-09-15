import { createRouter, createWebHistory } from "vue-router";

import DashboardPage from './components/DashboardPage.vue'
import TaskManager from './components/tasks/TaskManager.vue';
import UserManager from "./components/users/UserManager.vue";

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
    }
]

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;