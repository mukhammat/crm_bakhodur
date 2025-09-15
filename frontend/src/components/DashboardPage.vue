<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-title>Выполнено задач</v-card-title>
          <v-card-text class="text-h4">{{ stats.completed }}</v-card-text>
        </v-card>
      </v-col>
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
            <!-- Здесь можно вставить Recharts/Chart.js -->
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
  </v-container>
</template>

<script setup>
const stats = {
  completed: 120,
  inProgress: 15,
  pending: 40,
  points: 5800
}

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
</script>
