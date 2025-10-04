<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="14" md="10">
        <v-card>
          <v-data-table
            :headers="headers"
            :items="users"
            item-key="id"
            class="elevation-1"
            @click:row="handleRowClick"
            hover
          >
            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template #item.name="{ item }">
              {{ item.name }}
            </template>
            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template #item.email="{ item }">
              {{ item.email }}
            </template>
            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template #item.role="{ item }">
              <v-chip
                :color="getRoleColor(item.role)"
                size="small"
              >
                {{ item.role }}
              </v-chip>
            </template>
            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template #item.isActive="{ item }">
              <v-chip
                :color="item.isActive ? 'green' : 'red'"
                size="small"
              >
                {{ item.isActive ? 'Активен' : 'Неактивен' }}
              </v-chip>
            </template>
            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template #item.actions="{ item }">
              <div @click.stop>
                <v-btn
                  color="red"
                  size="small"
                  variant="outlined"
                  @click="deleteTask(item.id)"
                  :loading="deletingUsers.includes(item.id)"
                >
                  Удалить
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Диалог со статистикой задач -->
    <v-dialog v-model="showStatsDialog" max-width="600px">
      <v-card v-if="selectedUser">
        <v-card-title>
          <span class="text-h6">Статистика задач</span>
        </v-card-title>
        
        <v-card-subtitle class="mt-2">
          Пользователь: {{ selectedUser.name }}
        </v-card-subtitle>

        <v-card-text>
          <v-container v-if="loadingStats">
            <v-row justify="center">
              <v-col cols="12" class="text-center">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <p class="mt-4">Загрузка статистики...</p>
              </v-col>
            </v-row>
          </v-container>

          <v-container v-else-if="userStats">
            <v-row>
              <v-col cols="12" md="4" v-for="stat in userStats" :key="stat.status">
                <v-card 
                  :color="getStatusColor(stat.status)" 
                  variant="tonal"
                  class="pa-4"
                >
                  <div class="text-center">
                    <div class="text-h3 font-weight-bold">{{ stat.count }}</div>
                    <div class="text-subtitle-1 mt-2">{{ getStatusText(stat.status) }}</div>
                  </div>
                </v-card>
              </v-col>

              <v-col cols="12" class="mt-4">
                <v-divider></v-divider>
              </v-col>

              <v-col cols="12">
                <v-card variant="outlined" class="pa-4">
                  <div class="d-flex align-center justify-space-between">
                    <span class="text-h6">Всего задач:</span>
                    <span class="text-h4 font-weight-bold">{{ totalTasks }}</span>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-container>

          <v-container v-else>
            <v-alert type="info" variant="tonal">
              У пользователя пока нет назначенных задач
            </v-alert>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeStatsDialog">
            Закрыть
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, defineProps, toRef, computed } from 'vue'
import { userApi } from '../../api/user.api.js'
import { taskApi } from '../../api/task.api.js'

const props = defineProps({
  users: Array,
  getUsers: Function
})

const users = toRef(props, 'users')
const getUsers = props.getUsers
const deletingUsers = ref([])

// Статистика
const showStatsDialog = ref(false)
const selectedUser = ref(null)
const userStats = ref(null)
const loadingStats = ref(false)

const headers = [
  { title: 'Имя', key: 'name' },
  { title: 'Почта', key: 'email' },
  { title: 'Роль', key: 'role' },
  { title: 'Активный', key: 'isActive' },
  { title: 'Действия', key: 'actions', sortable: false },
]

// Вычисляем общее количество задач
const totalTasks = computed(() => {
  if (!userStats.value) return 0
  return userStats.value.reduce((sum, stat) => sum + parseInt(stat.count), 0)
})

// Обработчик клика на строку
async function handleRowClick(event, { item }) {
  selectedUser.value = item
  showStatsDialog.value = true
  await loadUserStats(item.id)
}

// Загрузка статистики пользователя
async function loadUserStats(userId) {
  try {
    loadingStats.value = true
    const response = await taskApi.getAssignmentLength(userId)
    const data = await response.json()
    
    if (data.rows && data.rows.length > 0) {
      userStats.value = data.rows
    } else {
      userStats.value = null
    }
  } catch (error) {
    console.error('Error loading user stats:', error)
    userStats.value = null
  } finally {
    loadingStats.value = false
  }
}

function closeStatsDialog() {
  showStatsDialog.value = false
  selectedUser.value = null
  userStats.value = null
}

async function deleteTask(userId) {
  try {
    deletingUsers.value.push(userId)
    const response = await userApi.delete(userId)
    if (response.ok) {
      await getUsers()
    }
  } catch (error) {
    console.error('Error deleting user:', error)
  } finally {
    deletingUsers.value = deletingUsers.value.filter(id => id !== userId)
  }
}

function getRoleColor(role) {
  switch (role) {
    case 'admin': return 'red'
    case 'manager': return 'blue'
    case 'worker': return 'green'
    default: return 'grey'
  }
}

function getStatusColor(status) {
  switch (status) {
    case 'completed': return 'green'
    case 'in_progress': return 'blue'
    case 'pending': return 'orange'
    default: return 'grey'
  }
}

function getStatusText(status) {
  switch (status) {
    case 'completed': return 'Завершено'
    case 'in_progress': return 'В процессе'
    case 'pending': return 'Ожидает'
    default: return status
  }
}
</script>

<style scoped>
.v-data-table :deep(tbody tr) {
  cursor: pointer;
}
</style>