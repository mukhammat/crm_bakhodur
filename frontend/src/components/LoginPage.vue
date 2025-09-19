<template>
  <v-container class="d-flex justify-center align-center fill-height">
    <v-card class="pa-6" width="400">
      <v-card-title class="text-h6">Login</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleLogin" ref="form">
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            prepend-icon="mdi-email"
            required
          />

          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            prepend-icon="mdi-lock"
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
            Войти
          </v-btn>
        </v-form>
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

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    await auth.login({ email: email.value, password: password.value })
    router.push('/tasks') // после логина редирект
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>
