import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})

const app = createApp(App)
const pinia = createPinia()

// 1. Подключаем Pinia ПЕРВОЙ
app.use(pinia)

// 2. Инициализируем auth store (восстанавливаем сессию из localStorage)
const authStore = useAuthStore()
authStore.init().finally(() => {
  // 3. После инициализации подключаем роутер и Vuetify
  app.use(router)
  app.use(vuetify)
  app.mount('#app')
})