import { defineStore } from 'pinia'

const SERVER = '';

export const useAuthStore = defineStore('auth', {
  state: () => {
    const token = localStorage.getItem('token') || null
    console.log('🔍 Auth Store initialized, token:', token ? 'EXISTS' : 'NULL')
    return {
      user: null,
      token: token,
      tokenExpiryTimer: null
    }
  },

  getters: {
    role: (state) => state.user?.role || null,
    isAuthenticated: (state) => !!state.token
  },

  actions: {
    // Устанавливаем таймер на истечение токена
    setTokenExpiry(expiresIn) {
      // Очищаем старый таймер если есть
      if (this.tokenExpiryTimer) {
        clearTimeout(this.tokenExpiryTimer)
      }

      // Устанавливаем новый таймер
      // expiresIn - время в секундах, переводим в миллисекунды
      const expiryTime = expiresIn * 1000
      
      this.tokenExpiryTimer = setTimeout(() => {
        console.warn('Token expired, logging out...')
        this.logout()
        
        // Опционально: показать уведомление пользователю
        // или редирект на страницу логина
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?reason=session_expired'
        }
      }, expiryTime)

      // Сохраняем время истечения в localStorage для восстановления после перезагрузки
      const expiryTimestamp = Date.now() + expiryTime
      localStorage.setItem('tokenExpiry', expiryTimestamp.toString())
    },

    // Проверяем, не истек ли токен при загрузке
    checkTokenExpiry() {
      const expiryTimestamp = localStorage.getItem('tokenExpiry')
      
      if (!expiryTimestamp) return false

      const now = Date.now()
      const expiry = parseInt(expiryTimestamp, 10)

      if (now >= expiry) {
        // Токен истек
        this.logout()
        return true
      }

      // Токен еще валиден, устанавливаем таймер на оставшееся время
      const remainingTime = Math.floor((expiry - now) / 1000)
      this.setTokenExpiry(remainingTime)
      return false
    },

    // Парсим строку типа '24h', '7d', '60s' в секунды
    parseExpiresIn(expiresIn) {
      if (typeof expiresIn === 'number') return expiresIn

      const match = expiresIn.match(/^(\d+)([smhd])$/)
      if (!match) return 3600 // По умолчанию 1 час

      const value = parseInt(match[1], 10)
      const unit = match[2]

      const units = {
        s: 1,           // секунды
        m: 60,          // минуты
        h: 3600,        // часы
        d: 86400        // дни
      }

      return value * (units[unit] || 3600)
    },

    async login({ email, password }) {
      console.log('🔐 Login attempt for:', email)
      try {
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
        console.log('✅ Login response:', data)
        
        this.token = data.token
        localStorage.setItem('token', this.token)
        console.log('💾 Token saved to localStorage')

        // Парсим expiresIn (поддерживает '24h', 3600, и т.д.)
        const expiresInSeconds = data.expiresIn 
          ? this.parseExpiresIn(data.expiresIn)
          : 3600

        console.log('⏰ Token expires in:', expiresInSeconds, 'seconds')
        this.setTokenExpiry(expiresInSeconds)
        
        await this.fetchMe()
        console.log('👤 User loaded:', this.user)
      } catch (error) {
        console.error('❌ Login error:', error)
        this.logout()
        throw error
      }
    },

    async register(dto) {
      try {
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
        await this.login({
          email: dto.email,
          password: dto.password
        })

        return responseData.data?.userId
      } catch (error) {
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
          if (res.status === 401) {
            this.logout()
            throw new Error('Сессия истекла')
          }
          throw new Error('Не удалось загрузить профиль')
        }

        const { data } = await res.json()
        this.user = data
      } catch (error) {
        if (error.message.includes('Сессия истекла')) {
          this.logout()
        }
        throw error
      }
    },

    logout() {
      // Очищаем таймер
      if (this.tokenExpiryTimer) {
        clearTimeout(this.tokenExpiryTimer)
        this.tokenExpiryTimer = null
      }

      this.user = null
      this.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('tokenExpiry')
    },

    async init() {
      if (this.token) {
        // Проверяем, не истек ли токен
        const isExpired = this.checkTokenExpiry()
        
        if (!isExpired) {
          try {
            await this.fetchMe()
          } catch (error) {
            console.warn('Failed to restore user session:', error.message)
          }
        }
      }
    }
  }
})