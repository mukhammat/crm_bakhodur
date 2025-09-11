import { createRouter, createWebHistory } from "vue-router";

import TaskList from './components/tasks/TaskList.vue';

const routes = [
    {
      path: "/tasks",
      name: "tasks",
      component: TaskList
    }
]

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;