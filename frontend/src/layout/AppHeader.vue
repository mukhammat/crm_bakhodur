<template>
  <v-app-bar app color="primary" dark elevation="2">
    <!-- Логотип или название -->
    <v-toolbar-title class="cursor-pointer" @click="goHome">
      🚀 MyApp
    </v-toolbar-title>

    <!-- Spacer чтобы кнопки ушли вправо -->
    <v-spacer></v-spacer>

    <!-- Кнопки меню -->
    <template v-for="item in menuItems" :key="item.name">
      <v-btn 
        @click="navigateTo(item.path)"
        :color="isActivePath(item.path) ? 'white' : ''"
        :variant="isActivePath(item.path) ? 'flat' : 'text'"
        class="mx-1"
      >
        <v-icon v-if="item.icon" start>{{ item.icon }}</v-icon>
        {{ item.name }}
      </v-btn>
    </template>

    <!-- Меню профиля -->
    <v-menu>
      <template #activator="{ props }">
        <v-btn 
          icon 
          v-bind="props"
          :color="isActivePath('/profile') ? 'white' : ''"
        >
          <v-icon>mdi-account-circle</v-icon>
        </v-btn>
      </template>
      
      <v-list>
        <v-list-item @click="navigateTo('/profile')">
          <template #prepend>
            <v-icon>mdi-account</v-icon>
          </template>
          <v-list-item-title>Профиль</v-list-item-title>
        </v-list-item>
        
        <v-list-item @click="navigateTo('/settings')">
          <template #prepend>
            <v-icon>mdi-cog</v-icon>
          </template>
          <v-list-item-title>Настройки</v-list-item-title>
        </v-list-item>
        
        <v-divider></v-divider>
        
        <v-list-item @click="logout">
          <template #prepend>
            <v-icon color="error">mdi-logout</v-icon>
          </template>
          <v-list-item-title>Выход</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

const router = useRouter()
const route = useRoute()

// Меню приложения - ИЗМЕНИТЕ ПУТИ НА СВОИ
const menuItems = [
  { name: 'Главная', path: '/', icon: 'mdi-home' },
  { name: 'Задачи', path: '/tasks', icon: 'mdi-clipboard-check' },
  { name: 'Работкики', path: '/users', icon: 'mdi-information' },
]

// Навигация по путям
const navigateTo = (path) => {
  if (route.path !== path) {
    router.push(path).catch(err => {
      console.error('Navigation error:', err)
    })
  }
}

const goHome = () => {
  navigateTo('/')
}

// Проверка активного пути
const isActivePath = (path) => {
  return computed(() => {
    if (path === '/') {
      return route.path === '/'
    }
    return route.path.startsWith(path)
  }).value
}

// Функция выхода
const logout = () => {
  // Здесь добавить логику выхода (очистка токенов и т.д.)
  console.log('Выход из системы')
  router.push('/login').catch(err => {
    console.error('Logout navigation error:', err)
  })
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  user-select: none;
}

.v-btn {
  transition: all 0.3s ease;
}

.v-btn:hover {
  transform: translateY(-2px);
}
</style>