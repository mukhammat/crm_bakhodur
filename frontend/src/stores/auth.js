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
      // шаг 1: логинимся и получаем токен
      const res = await fetch(`${SERVER}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!res.ok) throw new Error('Неверный логин или пароль')

      const { data } = await res.json()
      this.token = data.token
      localStorage.setItem('token', this.token)

      // шаг 2: сразу подтягиваем пользователя
      await this.fetchMe()
    },

    async register(dto) {
      const res = await fetch(`${SERVER}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      })

      if (!res.ok) throw new Error('Ошибка при регистрации')

      console.log(await res.json())

      return (await res.json()).data.userId
    },

    async fetchMe() {
      if (!this.token) return

      const res = await fetch(`${SERVER}/api/users/me`, {
        headers: { Authorization: `Bearer ${this.token}` }
      })

      if (!res.ok) {
        this.logout()
        throw new Error('Не удалось загрузить профиль')
      }

      const { data } = await res.json()
      this.user = data
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
    }
  }
})
