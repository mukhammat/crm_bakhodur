<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-title>В процессе</v-card-title>
          <v-card-text class="text-h4">{{ stats.inProgress }}</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-title>Ожидают</v-card-title>
          <v-card-text class="text-h4">{{ stats.pending }}</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-title>Сумма баллов</v-card-title>
          <v-card-text class="text-h4">{{ stats.points }}</v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Задачи по статусу</v-card-title>
          <v-card-text>
            <div class="text-center">[Диаграмма]</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Топ сотрудников</v-card-title>
          <v-data-table :headers="userHeaders" :items="topUsers" />
        </v-card>
      </v-col>
    </v-row>

    <div v-if="error" class="text-red">Ошибка: {{ error }}</div>
  </v-container>
</template>

<script setup>
import { taskApi } from '../api/task.api'
import { ref, onMounted } from 'vue'

const stats = ref({
  inProgress: 0,
  pending: 0,
  points: 0
})

const error = ref(null)

const userHeaders = [
  { title: 'Имя', key: 'name' },
  { title: 'Выполнено задач', key: 'tasksCompleted' },
  { title: 'Баллы', key: 'points' }
]

const topUsers = [
  { name: 'Иван', tasksCompleted: 50, points: 1200 },
  { name: 'Анна', tasksCompleted: 45, points: 1100 },
  { name: 'Олег', tasksCompleted: 30, points: 700 }
]

async function fetchTasks(status) {
  const response = await taskApi.getAll({ status })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Ошибка ${response.status}: ${text}`)
  }
  return response.json()
}

onMounted(async () => {
  try {
    // В процессе
    const inProgressRes = await fetchTasks('in_progress')
    stats.value.inProgress = inProgressRes.data.tasks.length

    // Ожидают
    const pendingRes = await fetchTasks('pending')
    stats.value.pending = pendingRes.data.tasks.length

    // Сумма баллов (считаем по in_progress + pending)
    const allTasks = [
      ...inProgressRes.data.tasks,
      ...pendingRes.data.tasks
    ]
    stats.value.points = allTasks.reduce(
      (sum, t) => sum + (t.points ?? 0),
      0
    )
  } catch (err) {
    error.value = err.message
    console.error('Ошибка загрузки задач:', err)
  }
})
</script>
