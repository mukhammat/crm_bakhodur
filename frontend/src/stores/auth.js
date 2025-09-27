import { defineStore } from 'pinia'

const SERVER = 'http://localhost:3000';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,   // { id, email, role }
    token: localStorage.getItem('token') || null,
  }),

  getters: {
    role: (state) => state.user?.role || null,
    isAuthenticated: (state) => !!state.token
  },

  actions: {
    async login({ email, password }) {
      try {
        // шаг 1: логинимся и получаем токен
        const res = await fetch(`${SERVER}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.message || 'Неверный логин или пароль')
        }

        const { data } = await res.json()
        this.token = data.token
        localStorage.setItem('token', this.token)

        // шаг 2: сразу подтягиваем пользователя
        await this.fetchMe()
      } catch (error) {
        // Очищаем состояние в случае ошибки
        this.logout()
        throw error
      }
    },

    async register(dto) {
      try {
        // Шаг 1: Регистрируемся
        const res = await fetch(`${SERVER}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dto)
        })

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.message || 'Ошибка при регистрации')
        }

        const responseData = await res.json()
        console.log('Registration successful:', responseData)

        // Шаг 2: Автоматически логинимся с теми же данными
        await this.login({
          email: dto.email,
          password: dto.password
        })

        return responseData.data?.userId
      } catch (error) {
        // Очищаем состояние в случае ошибки
        this.logout()
        throw error
      }
    },

    async fetchMe() {
      if (!this.token) return

      try {
        const res = await fetch(`${SERVER}/api/users/me`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })

        if (!res.ok) {
          // Если токен невалидный, очищаем состояние
          if (res.status === 401) {
            this.logout()
            throw new Error('Сессия истекла')
          }
          throw new Error('Не удалось загрузить профиль')
        }

        const { data } = await res.json()
        this.user = data
      } catch (error) {
        // Если ошибка авторизации, очищаем состояние
        if (error.message.includes('Сессия истекла')) {
          this.logout()
        }
        throw error
      }
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
    },

    // ДОБАВЛЕНО: инициализация при загрузке приложения
    async init() {
      if (this.token) {
        try {
          await this.fetchMe()
        } catch (error) {
          console.warn('Failed to restore user session:', error.message)
          // Не пробрасываем ошибку, просто логируем
        }
      }
    }
  }
})