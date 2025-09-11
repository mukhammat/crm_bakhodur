<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>
            Task List
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="getTasks">Refresh</v-btn>
          </v-card-title>

          <v-data-table
            :headers="headers"
            :items="tasks"
            item-key="id"
            class="elevation-1"
          >
          <template v-slot:item-status="{ item }">
          <v-chip :color="item?.status === 'completed' ? 'green' : 'orange'" dark>
              {{ item?.status }}
          </v-chip>
          </template>

          <!-- Описание задачи -->
          <template v-slot:item-description="{ item }">
            {{ item?.descriptions || 'No description' }}
          </template>

          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const tasks = ref([])

const headers = [
  { text: 'ID', value: 'id' },
  { text: 'Title', value: 'title' },
  { text: 'Description', value: 'description' }, // Новая колонка
  { text: 'Status', value: 'status' },
]

async function getTasks() {
  try {
    const response = await fetch('http://localhost:3000/api/tasks', {
      headers: {
        'Content-Type': 'application/json',
        authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjJkNzlhNzA1LTJhODQtNDkyMC1iYWNmLWI4OWRjNGJmNzkzYyIsImVtYWlsIjoiZG9zbmV0MjIwMEBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTc1NTkzNTIsImV4cCI6MTc1NzY0NTc1Mn0.5IaZ110jJHeE4DOuli_tLztImcMr29RNGMpO8tcwdNU',
      },
    })
    const data = await response.json()
    console.log(data)
    tasks.value = data.data.tasks
  } catch (error) {
    console.error('Error fetching tasks:', error)
  }
}

onMounted(() => {
  getTasks()
})
</script>
