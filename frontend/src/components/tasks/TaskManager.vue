<template>
    <TaskForm :getTasks="getTasks"></TaskForm>
    <TaskList :getTasks="getTasks" :tasks="tasks" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TaskForm from './TaskForm.vue'
import TaskList from './TaskList.vue'

const TOKEN =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjlkYTQwZmIzLWQ4MGQtNGNjNy05NzYwLWMzMzU1YTMxMTU1OCIsImVtYWlsIjoiZG9zbmV0MjIwMEBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTc5NTU1MjEsImV4cCI6MTc1ODA0MTkyMX0.v9XsylKfH_Kjux08TFwHsNLykDUVZ-OEdKcveV0TAMo' // вынеси в .env


const tasks = ref([])

async function getTasks() {
  try {
    const response = await fetch('http://localhost:3000/api/tasks', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: TOKEN,
      },
    })
    const data = await response.json()
    tasks.value = data.data.tasks
  } catch (error) {
    console.error('Error fetching tasks:', error)
  }
}

onMounted(getTasks)
</script>
