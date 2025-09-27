<template>
  <v-container class="d-flex justify-center align-center fill-height">
    <v-card class="pa-6" width="400">
      <v-card-title class="text-h6">Регистрация</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleRegister" ref="form">
          <v-text-field
            v-model="name"
            label="Имя"
            prepend-icon="mdi-account"
            required
          />

          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            prepend-icon="mdi-email"
            required
          />

          <v-text-field
            v-model="password"
            label="Пароль"
            type="password"
            prepend-icon="mdi-lock"
            required
          />

          <v-text-field
            v-model="key"
            label="Ключ регистрации"
            prepend-icon="mdi-key"
            required
          />

          <v-alert
            v-if="error"
            type="error"
            class="mb-4"
            dense
          >
            {{ error }}
          </v-alert>

          <v-btn
            type="submit"
            color="primary"
            block
            :loading="loading"
          >
            Зарегистрироваться
          </v-btn>
        </v-form>

        <v-divider class="my-4"></v-divider>

        <div class="text-center">
          <span class="text-body-2">Уже есть аккаунт?</span>
          <v-btn
            variant="text"
            color="primary"
            @click="$router.push('/login')"
            class="ml-2"
          >
            Войти
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const key = ref('')
const error = ref('')
const loading = ref(false)

const handleRegister = async () => {
  error.value = ''
  loading.value = true

  try {
    await auth.register({ 
      name: name.value,
      email: email.value, 
      password: password.value,
      key: key.value
    })
    router.push('/tasks') // после регистрации редирект
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>