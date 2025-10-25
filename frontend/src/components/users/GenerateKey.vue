<template>
  <v-container>
    <v-row justify="center">
      <v-col v-if="!isAdmin" cols="10" md="5">
        <v-card>
          <v-card-title>Сгенерировать ключ</v-card-title>
          <v-card-text>
            <!-- Выбор роли -->
            <v-select
              v-model="selectedRole"
              :items="roles"
              item-title="title"
              item-value="value"
              label="Выберите роль"
              variant="outlined"
              class="mb-4"
            ></v-select>

            <!-- Кнопка генерации -->
            <v-btn 
              color="primary" 
              @click="generateKey"
              :disabled="!selectedRole"
              block
              class="mb-4"
            >
              Сгенерировать ключ
            </v-btn>

            <!-- Отображение сгенерированного ключа -->
            <v-card 
              v-if="generatedKey" 
              variant="outlined" 
              class="mb-4"
            >
              <v-card-text>
                <div class="d-flex align-center">
                  <v-chip 
                    :color="getRoleColor(selectedRole)" 
                    class="me-2"
                  >
                    {{ getRoleTitle(selectedRole) }}
                  </v-chip>
                  <span class="text-caption text-medium-emphasis">
                    Роль
                  </span>
                </div>
                
                <v-divider class="my-3"></v-divider>
                
                <div class="mb-3">
                  <div class="text-subtitle-2 mb-2">Сгенерированный ключ:</div>
                  <v-text-field
                    :model-value="generatedKey"
                    readonly
                    variant="outlined"
                    density="compact"
                    class="key-field"
                  >
                    <template #append-inner>
                      <v-btn
                        icon="mdi-content-copy"
                        size="small"
                        variant="text"
                        @click="copyKey"
                      ></v-btn>
                    </template>
                  </v-text-field>
                </div>

                <!-- Кнопки действий -->
                <div class="d-flex gap-2">
                  <v-btn
                    color="success"
                    variant="outlined"
                    prepend-icon="mdi-content-copy"
                    @click="copyKey"
                  >
                    Копировать
                  </v-btn>
                  
                  <v-btn
                    color="primary"
                    variant="outlined"
                    prepend-icon="mdi-share"
                    @click="shareKey"
                  >
                    Поделиться
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>

            <!-- Уведомление о копировании -->
            <v-snackbar
              v-model="showCopyNotification"
              color="success"
              timeout="2000"
            >
              Ключ скопирован в буфер обмена!
              <template #actions>
                <v-btn
                  variant="text"
                  @click="showCopyNotification = false"
                >
                  Закрыть
                </v-btn>
              </template>
            </v-snackbar>

            <!-- Уведомление об ошибке -->
            <v-snackbar
              v-model="showErrorNotification"
              color="error"
              timeout="3000"
            >
              {{ errorMessage }}
              <template #actions>
                <v-btn
                  variant="text"
                  @click="showErrorNotification = false"
                >
                  Закрыть
                </v-btn>
              </template>
            </v-snackbar>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { userRoleApi } from '../../api/user-role.api'

// Реактивные данные
const selectedRole = ref('')
const generatedKey = ref('')
const showCopyNotification = ref(false)
const showErrorNotification = ref(false)
const errorMessage = ref('')

// Роли
const roles = [
  { title: 'Менеджер', value: 'MANAGER' },
  { title: 'Работник', value: 'WORKER' }
]

// Функция генерации ключа
const generateKey = async () => {
  try {
    if (!selectedRole.value) return
  
      const response = await userRoleApi.generateKey(selectedRole.value)

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Ошибка при генерации ключа');
    }
    
    generatedKey.value = data.data.key
    
  } catch (error) {
    errorMessage.value = error.message || 'Ошибка при генерации ключа'
    showErrorNotification.value = true
  }
}

// Функция копирования ключа
const copyKey = async () => {
  try {
    await navigator.clipboard.writeText(generatedKey.value)
    showCopyNotification.value = true
  } catch (err) {
    errorMessage.value = 'Не удалось скопировать ключ'
    showErrorNotification.value = true
  }
}

// Функция поделиться ключом
const shareKey = async () => {
  const shareData = {
    title: 'Ключ доступа',
    text: `Ключ доступа (${getRoleTitle(selectedRole.value)}): ${generatedKey.value}`,
    url: window.location.href
  }

  try {
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      // Fallback - копируем в буфер обмена
      await navigator.clipboard.writeText(shareData.text)
      showCopyNotification.value = true
    }
  } catch (err) {
    errorMessage.value = 'Не удалось поделиться ключом'
    showErrorNotification.value = true
  }
}

// Получить цвет для роли
const getRoleColor = (role) => {
  const colors = {
    MANAGER: 'orange',
    WORKER: 'blue'
  }
  return colors[role] || 'grey'
}

// Получить название роли
const getRoleTitle = (role) => {
  const roleObj = roles.find(r => r.value === role)
  return roleObj ? roleObj.title : ''
}
</script>

<style scoped>
.key-field {
  font-family: monospace;
  font-weight: bold;
}
</style>