import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TodoView from '../views/TodoView.vue'
import AboutView from '../views/AboutView.vue'
import HelloWorld from '../components/HelloWorld.vue'
import AppHeader from '../layout/AppHeader.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      components: {
        header: AppHeader,
        //default: HomeView,
        //footer: HelloWorld
      }
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },
    {
      path: '/todo',
      name: 'todo',
      component: TodoView,
    },
  ],
})

export default router
