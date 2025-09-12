import { createRouter, createWebHistory } from "vue-router";

import TaskManager from './components/tasks/TodoManager.vue';

const routes = [
    {
      path: "/tasks",
      name: "tasks",
      component: TaskManager
    }
]

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;